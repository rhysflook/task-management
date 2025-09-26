<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RemoveFrontendFeature extends Command
{
    protected $signature = 'app:remove-frontend-feature';
    protected $description = 'Remove a previously created frontend feature';

    protected $stubLocations = [
        'model' => 'backend/app/Models/{cFeatureName}.php',
        'request' => 'backend/app/Http/Requests/{cFeatureName}Request.php',
        'controller' => 'backend/app/Http/Controllers/{cFeatureName}Controller.php',
        'resource' => 'backend/app/Http/Resources/{cFeatureName}Resource.php',
        'collection' => 'backend/app/Http/Resources/{cFeatureName}Collection.php',
        'seeder' => 'backend/database/seeders/{cFeatureName}Seeder.php',
        'migration' => 'backend/database/migrations/*_create_{pFeatureName}_table.php',
        'createPage' => 'frontend/src/pages/{featureName}/Create{cFeatureName}.jsx',
        'editPage' => 'frontend/src/pages/{featureName}/Edit{cFeatureName}.jsx',
        'dashboard' => 'frontend/src/pages/{featureName}/{cFeatureName}Dashboard.jsx',
        'listPage' => 'frontend/src/pages/{featureName}/List{cFeatureName}s.jsx',
        'api' => 'frontend/src/services/{featureName}.js',
        'store' => 'frontend/src/stores/reducers/{featureName}Slice.js',
        'type_def' => 'frontend/src/types/{pFeatureName}/{featureName}.d.js',
    ];

    public function handle()
    {
        $pFeatureName = $this->ask('Enter pFeatureName');
        $featureName = \Illuminate\Support\Str::singular($pFeatureName);
        $cFeatureName = ucfirst($featureName);

        $parentBasePath = dirname(base_path());

        // 1. Remove generated files
        foreach ($this->stubLocations as $key => $destPattern) {
            $destPath = str_replace(
                ['{featureName}', '{cFeatureName}', '{pFeatureName}'],
                [$featureName, $cFeatureName, $pFeatureName],
                $destPattern
            );

            // Handle migration glob
            if (strpos($destPath, '*') !== false) {
                foreach (glob($parentBasePath . '/' . $destPath) as $migrationFile) {
                    @unlink($migrationFile);
                    $this->info("Removed migration: {$migrationFile}");
                }
                continue;
            }

            $fullPath = $parentBasePath . '/' . $destPath;
            if (file_exists($fullPath)) {
                @unlink($fullPath);
                $this->info("Removed: {$fullPath}");
            }
        }

        // 3. Rollback App.jsx modifications
        $appPath = $parentBasePath . '/frontend/src/App.jsx';
        if (file_exists($appPath)) {
            $appContent = file_get_contents($appPath);

            // Remove imports
            $appContent = preg_replace(
                "/import {$cFeatureName}Dashboard.*;\n?/i",
                '',
                $appContent
            );
            $appContent = preg_replace(
                "/import Create{$cFeatureName}.*;\n?/i",
                '',
                $appContent
            );
            $appContent = preg_replace(
                "/import Edit{$cFeatureName}.*;\n?/i",
                '',
                $appContent
            );
            $appContent = preg_replace(
                "/import List{$cFeatureName}s.*;\n?/i",
                '',
                $appContent
            );

            // Remove routes
            $routePatterns = [
                "<Route path=\"/{$pFeatureName}\" element=<UserRoute><{$cFeatureName}Dashboard /></UserRoute> />",
                "<Route path=\"/{$pFeatureName}/list\" element=<UserRoute><List{$cFeatureName}s /></UserRoute> />",
                "<Route path=\"/{$pFeatureName}/create\" element=<UserRoute><Create{$cFeatureName} /></UserRoute> />",
                "<Route path=\"/{$pFeatureName}/:id/edit\" element=<UserRoute><Edit{$cFeatureName} /></UserRoute> />",
            ];

            foreach ($routePatterns as $pattern) {
                $quoted = preg_quote($pattern, '/'); // escape / and special chars
                $appContent = preg_replace("/$quoted\s*/", '', $appContent);
            }

            file_put_contents($appPath, $appContent);
            $this->info("Updated: {$appPath}");
        }
    }
}
