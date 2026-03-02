<?php

namespace App\Console\Commands;

use App\Events\HeartbeatStopped;
use App\Models\Bed;
use App\Models\Client;
use App\Models\Heartbeat;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

class CheckHeartbeats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-heartbeats';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $heartbeats = Heartbeat::all();
        $timenow = now();
        foreach ($heartbeats as $heartbeat) {
            // Perform your heartbeat check logic here
            $this->info("Checking heartbeat for ID: {$heartbeat->id}");
            
            if (!$heartbeat->isAlive()) {
                $this->warn("Heartbeat ID {$heartbeat->id} is not alive!");
                $latestLog = DB::table('heartbeat_logs')
                    ->where('device_id', $heartbeat->device_id)
                    ->orderByDesc('id')
                    ->first();
                
                if (!$latestLog || $latestLog->status !== '死') {
                    $client = Client::where('device_id', $heartbeat->device_id)->first();
                    $bed = Bed::find($client->bed_id);   
                    \Log::info('Heartbeat Stopped for Device ID: '.$heartbeat->device_id);
                    Event::dispatch(new HeartbeatStopped($heartbeat->device_id));
                    DB::table('heartbeat_logs')->insert([
                        'device_id' => $heartbeat->device_id,
                        'unit' => $bed?->room?->unit?->name,
                        'room' => $bed?->room?->name,
                        'bed' => $bed?->bed_no,
                        'status' => '死',
                        'created_at' => $timenow,
                        'updated_at' => $timenow,
                    ]);
                }
                continue;
            } else {
                $this->info("Heartbeat ID {$heartbeat->id} is alive.");
                $latestLog = DB::table('heartbeat_logs')
                    ->where('device_id', $heartbeat->device_id)
                    ->orderByDesc('id')
                    ->first();

                if (!$latestLog || $latestLog->status !== '生') {
                    Event::dispatch(new HeartbeatStopped($heartbeat->device_id));
                    DB::table('heartbeat_logs')->insert([
                        'device_id' => $heartbeat->device_id,
                        'status' => '生',
                        'created_at' => $timenow,
                        'updated_at' => $timenow,
                    ]);
                }
            }

            $this->info("Last heartbeat at: {$heartbeat->last_heartbeat}");
        }
    }
}
