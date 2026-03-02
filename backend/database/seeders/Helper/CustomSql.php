<?php

namespace Database\Seeders\Helper;


class CustomSql
{
    public static $CTE = <<<SQL
    WITH ex AS (
            SELECT
                e.number AS exten_number,
                e.owner_type,
                e.owner_id
            FROM extensions e
            WHERE e.number = :callerid
        ),
        conn AS (
            SELECT
                e.number AS conn_number,
                e.owner_type,
                e.owner_id
            FROM extensions e
            WHERE e.number = :connected_exten
        ),
        -- resolve exten chain
        exten_resolved AS (
            SELECT
                CASE
                    WHEN ex.owner_type = 'App\Models\Staff' THEN ex.owner_id
                    ELSE NULL
                END AS staff_id,
                CASE
                    WHEN ex.owner_type = 'App\Models\Client' THEN p.id
                    ELSE NULL
                END AS patient_id,
                CASE
                    WHEN ex.owner_type = 'App\Models\Client' THEN r.unit_id
                    WHEN ex.owner_type = 'App\Models\Staff' THEN st.unit_id
                    ELSE NULL
                END AS unit_id,
                CASE
                    WHEN ex.owner_type = 'App\Models\Client' THEN b.room_id
                    ELSE NULL
                END AS room_id,
                CASE
                    WHEN ex.owner_type = 'App\Models\Client' THEN b.id
                    ELSE NULL
                END AS bed_id,
                CASE
                    WHEN ex.owner_type = 'App\Models\Client' THEN c.id
                    ELSE NULL
                END AS client_id
            FROM ex
            LEFT JOIN staff st ON st.id = ex.owner_id AND ex.owner_type = 'App\Models\Staff'
            LEFT JOIN patients p ON p.id = ex.owner_id AND ex.owner_type = 'App\Models\Client'
            LEFT JOIN beds b ON b.id = p.bed_id::uuid
            LEFT JOIN clients c ON b.id = c.bed_id::uuid
            LEFT JOIN rooms r ON r.id = b.room_id
        ),
        -- resolve connected_endpoint chain
        conn_resolved AS (
            SELECT
                CASE
                    WHEN conn.owner_type = 'App\Models\Staff' THEN conn.owner_id
                    ELSE NULL
                END AS staff_id,
                CASE
                    WHEN conn.owner_type = 'App\Models\Client' THEN p.id
                    ELSE NULL
                END AS patient_id,
                CASE
                    WHEN conn.owner_type = 'App\Models\Client' THEN r.unit_id
                    WHEN conn.owner_type = 'App\Models\Staff' THEN st.unit_id
                    ELSE NULL
                END AS unit_id,
                CASE
                    WHEN conn.owner_type = 'App\Models\Client' THEN b.room_id
                    ELSE NULL
                END AS room_id,
                CASE
                    WHEN conn.owner_type = 'App\Models\Client' THEN b.id
                    ELSE NULL
                END AS bed_id,
                CASE
                    WHEN conn.owner_type = 'App\Models\Client' THEN c.id
                    ELSE NULL
                END AS client_id
            FROM conn
            LEFT JOIN staff st ON st.id = conn.owner_id AND conn.owner_type = 'App\Models\Staff'
            LEFT JOIN patients p ON p.id = conn.owner_id AND conn.owner_type = 'App\Models\Client'
            LEFT JOIN beds b ON b.id = p.bed_id::uuid
            LEFT JOIN clients c ON b.id = c.bed_id::uuid
            LEFT JOIN rooms r ON r.id = b.room_id
        ),
        foreign_ids as (
        SELECT
            COALESCE(er.staff_id, cr.staff_id) as staff_id,
            COALESCE(er.patient_id, cr.patient_id) as patient_id,
            COALESCE(er.unit_id, cr.unit_id) as unit_id,
            COALESCE(er.room_id, cr.room_id) as room_id,
            COALESCE(er.bed_id, cr.bed_id) as bed_id,
            COALESCE(er.client_id, cr.client_id) as client_id
        FROM exten_resolved er
        FULL JOIN conn_resolved cr ON TRUE
        )
    SQL;

    public static function insertCallHistory($params)
    {
        return \DB::statement(
            self::$CTE . " INSERT INTO call_logs (callerid, channel, exten, uniqueid, bridge_uuid, call_started, call_connected, call_ended, connected_endpoint, created_at, updated_at, staff_id, patient_id, unit_id, room_id, bed_id, client_id)
        SELECT :callerid, :channel, :exten, :uniqueid, :bridge_uuid, :call_started, :call_connected, :call_ended, :connected_endpoint, :created_at, :updated_at, foreign_ids.staff_id, foreign_ids.patient_id, foreign_ids.unit_id, foreign_ids.room_id, foreign_ids.bed_id, foreign_ids.client_id
        FROM foreign_ids;",
            $params
        );
    }

    public static function insertSipRegHistory($params)
    {
        return \DB::statement(
            self::$CTE . " INSERT INTO sip_registration_logs (aor, endpoint, peer, uri, privilege, contact_status, peer_status, staff_id, patient_id, unit_id, room_id, bed_id, client_id, created_at, updated_at)
            SELECT :aor, :endpoint, :peer, :uri, :privilege, :contact_status, :peer_status, foreign_ids.staff_id, foreign_ids.patient_id, foreign_ids.unit_id, foreign_ids.room_id, foreign_ids.bed_id, foreign_ids.client_id, NOW(), NOW()
            FROM foreign_ids;",
            $params
        );
    }

    public static function insertMqttLog($params)
    {
        return \DB::statement(
            self::$CTE . "  INSERT INTO mqtt_logs (device_id, topic, payload, staff_id, patient_id, unit_id, room_id, bed_id, client_id, created_at, updated_at)
            SELECT :device_id, :topic, :payload, f.staff_id, f.patient_id, f.unit_id, f.room_id, f.bed_id, f.client_id, NOW(), NOW()
            FROM  (
                SELECT * FROM foreign_ids
                UNION ALL
                SELECT NULL, NULL, NULL, NULL, NULL, NULL
                WHERE NOT EXISTS (SELECT 1 FROM foreign_ids)
            ) f;",
            $params
        );
    }
}
