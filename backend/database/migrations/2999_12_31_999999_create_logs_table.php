<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (app()->environment('testing')) {
            return; // skip this migration in testing
        }
        Schema::create('call_logs', function (Blueprint $table) {
            $table->id();
            $table->string('callerid', 255);
            $table->string('channel', 255);
            $table->string('uniqueid', 255);
            $table->string('exten', 255);
            $table->string('bridge_uuid', 255)->nullable();
            $table->string('connected_endpoint', 255)->nullable();
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->uuid('unit_id')->nullable(); // match unit.id type
            $table->foreign('unit_id')->references('id')->on('units')->nullable()->nullOnDelete();
            $table->uuid('room_id')->nullable(); // match rooms.id type
            $table->foreign('room_id')->references('id')->on('rooms')->nullable()->nullOnDelete();
            $table->uuid('bed_id')->nullable(); // match beds.id type
            $table->foreign('bed_id')->references('id')->on('beds')->nullable()->nullOnDelete();
            $table->timestamp('call_started')->nullable();
            $table->timestamp('call_connected')->nullable();
            $table->timestamp('call_ended')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('mqtt_logs', function (Blueprint $table) {
            $table->id();
            $table->string('topic', 255);
            $table->string('device_id', 255);
            $table->text('payload');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->uuid('unit_id')->nullable(); // match unit.id type
            $table->foreign('unit_id')->references('id')->on('units')->nullable()->nullOnDelete();
            $table->uuid('room_id')->nullable(); // match rooms.id type
            $table->foreign('room_id')->references('id')->on('rooms')->nullable()->nullOnDelete();
            $table->uuid('bed_id')->nullable(); // match beds.id type
            $table->foreign('bed_id')->references('id')->on('beds')->nullable()->nullOnDelete();
            $table->enum('status', [0, 1, 2])->default(0); // 0: 未処理, 1: 処理中, 2: 処理済
            $table->timestamp('status_updated_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('sip_registration_logs', function (Blueprint $table) {
            $table->id();
            $table->string('aor', 255)->nullable();
            $table->string('endpoint', 255)->nullable();
            $table->string('peer', 255)->nullable();
            $table->string('uri', 255)->nullable();
            $table->string('privilege', 255)->nullable();
            $table->string('contact_status', 255)->nullable();
            $table->string('peer_status', 255)->nullable();
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->uuid('unit_id')->nullable(); // match unit.id type
            $table->foreign('unit_id')->references('id')->on('units')->nullable()->nullOnDelete();
            $table->uuid('room_id')->nullable(); // match rooms.id type
            $table->foreign('room_id')->references('id')->on('rooms')->nullable()->nullOnDelete();
            $table->uuid('bed_id')->nullable(); // match beds.id type
            $table->foreign('bed_id')->references('id')->on('beds')->nullable()->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // Drop view if it already exists
        DB::statement("DROP VIEW IF EXISTS combined_logs");

        // Create the view
        DB::statement("
            CREATE VIEW combined_logs AS
            WITH cl AS (
                SELECT 
                    s.name AS staff_name,
                    cl.exten AS extension,
                    p.name AS patient_name,
                    '通話' AS data_kbn,
                    cl.call_connected AS time_stamp,
                    u.name AS unit_name,
                    r.name AS room_name,
                    b.bed_no AS bed_no,
                    cl.deleted_at
                FROM call_logs cl
                LEFT JOIN staff s ON s.id = cl.staff_id
                LEFT JOIN patients p ON p.id = cl.patient_id
                LEFT JOIN units u ON u.id = cl.unit_id
                LEFT JOIN rooms r ON r.id = cl.room_id
                LEFT JOIN beds b ON b.id = cl.bed_id
            ),
            ml AS (
                SELECT
                    s.name AS staff_name,
                    ml.device_id AS extension,
                    p.name AS patient_name,
                    'センサー' AS data_kbn,
                    ml.created_at AS time_stamp,
                    u.name AS unit_name,
                    r.name AS room_name,
                    b.bed_no AS bed_no,
                    ml.deleted_at
                FROM mqtt_logs ml
                LEFT JOIN staff s ON s.id = ml.staff_id
                LEFT JOIN patients p ON p.id = ml.patient_id
                LEFT JOIN units u ON u.id = ml.unit_id
                LEFT JOIN rooms r ON r.id = ml.room_id
                LEFT JOIN beds b ON b.id = ml.bed_id
            ),
            sl AS (
                SELECT
                    s.name AS staff_name,
                    sl.aor AS extension,
                    p.name AS patient_name,
                    'SIP登録' AS data_kbn,
                    sl.created_at AS time_stamp,
                    u.name AS unit_name,
                    r.name AS room_name,
                    b.bed_no AS bed_no,
                    sl.deleted_at
                FROM sip_registration_logs sl
                LEFT JOIN staff s ON s.id = sl.staff_id
                LEFT JOIN patients p ON p.id = sl.patient_id
                LEFT JOIN units u ON u.id = sl.unit_id
                LEFT JOIN rooms r ON r.id = sl.room_id
                LEFT JOIN beds b ON b.id = sl.bed_id
            ),
            sk AS (
                 SELECT
                    '' AS staff_name,
                    e.number AS extension,
                    '' AS patient_name,
                    CONCAT('死活：', sk.status) AS data_kbn,
                    sk.created_at AS time_stamp,
                    '' AS unit_name,
                    '' AS room_name,
                    '' AS bed_no,
                    '' AS deleted_at
                FROM  heartbeat_logs sk
                LEFT JOIN clients c ON c.device_id = sk.device_id::text
                left join extensions e on c.extension_id = e.id
            ),
            all_logs AS (
                SELECT * FROM cl
                UNION ALL
                SELECT * FROM ml
                UNION ALL
                SELECT * FROM sl

            )
            SELECT
                ROW_NUMBER() OVER (ORDER BY time_stamp DESC) AS id,
                staff_name,
                extension,
                patient_name,
                data_kbn,
                time_stamp,
                unit_name,
                room_name,
                bed_no,
                deleted_at
            FROM all_logs;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS combined_logs");
        Schema::dropIfExists('call_logs');
        Schema::dropIfExists('mqtt_logs');
        Schema::dropIfExists('sip_registration_logs');
    }
};
