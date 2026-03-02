<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RemoveFrontendFeature extends Command
{
    protected $signature = 'app:remove-frontend-feature';
    protected $description = 'Remove a previously created frontend feature';

    protected $backend_dir;
    protected $frontend_dir;
    protected $stubLocations;

    public function __construct()
    {
        parent::__construct();

        $this->backend_dir = env('BACKEND_DIR', 'backend');
        $this->frontend_dir = env('FRONTEND_DIR', 'frontend');

        $this->stubLocations = [
            'model' => "{$this->backend_dir}/app/Models/{cFeatureName}.php",
            'request' => "{$this->backend_dir}/app/Http/Requests/{cFeatureName}Request.php",
            'controller' => "{$this->backend_dir}/app/Http/Controllers/{cFeatureName}Controller.php",
            'resource' => "{$this->backend_dir}/app/Http/Resources/{cFeatureName}Resource.php",
            'collection' => "{$this->backend_dir}/app/Http/Resources/{cFeatureName}Collection.php",
            'seeder' => "{$this->backend_dir}/database/seeders/{cFeatureName}Seeder.php",
            'migration' => "{$this->backend_dir}/database/migrations/*_create_{pFeatureName}_table.php",
            'createPage' => "{$this->frontend_dir}/src/pages/{pFeatureName}/Create{cFeatureName}.jsx",
            'editPage' => "{$this->frontend_dir}/src/pages/{pFeatureName}/Edit{cFeatureName}.jsx",
            'dashboard' => "{$this->frontend_dir}/src/pages/{pFeatureName}/{cFeatureName}Dashboard.jsx",
            'listPage' => "{$this->frontend_dir}/src/pages/{pFeatureName}/List{cFeatureName}s.jsx",
            'api' => "{$this->frontend_dir}/src/services/{featureName}.js",
            'store' => "{$this->frontend_dir}/src/stores/reducers/{featureName}Slice.js",
            'type_def' => "{$this->frontend_dir}/src/types/{pFeatureName}/{featureName}.d.js",
        ];
    }

    public function handle()
    {
        $pFeatureName = $this->ask('Enter pFeatureName (e.g. unitMaps)');
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

        // 2. Remove entry from nav.config.json
        $navPath = $parentBasePath .'/'. $this->frontend_dir . '/src/features/main/nav.config.json';
        if (file_exists($navPath)) {
            $navContent = file_get_contents($navPath);
            $navItems = json_decode($navContent, true);

            if (!is_array($navItems)) {
                $navItems = [];
            }

            // Remove any entry whose path matches "/$pFeatureName"
            $basePath = '/' . $pFeatureName;

            $filtered = [];
            foreach ($navItems as $item) {
                // Remove if path is exactly the base path
                if (
                    (isset($item['path']) && ($item['path'] === $basePath))
                ) {
                    $this->info("Removed nav entry: " . (isset($item['label']) ? $item['label'] : $item['path']));
                    continue;
                }
                $filtered[] = $item;
            }

            // Write back with pretty print and unescaped unicode (for Japanese)
            file_put_contents(
                $navPath,
                json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
            $this->info("Updated: {$navPath}");
        }

        // 3. Rollback App.jsx modifications
        $appPath = $parentBasePath .'/'. $this->frontend_dir . '/src/App.jsx';
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
                "<Route path=\"/{$pFeatureName}\" element={RouteElementWrapper(\"{$pFeatureName}\", <UserRoute><{$cFeatureName}Dashboard /></UserRoute>)} />",
                "<Route path=\"/{$pFeatureName}/list\" element={RouteElementWrapper(\"{$pFeatureName}\", <UserRoute><List{$cFeatureName}s /></UserRoute>)} />",
                "<Route path=\"/{$pFeatureName}/create\" element={RouteElementWrapper(\"{$pFeatureName}\", <UserRoute><Create{$cFeatureName} /></UserRoute>)} />",
                "<Route path=\"/{$pFeatureName}/:id/edit\" element={RouteElementWrapper(\"{$pFeatureName}\", <UserRoute><Edit{$cFeatureName} /></UserRoute>)} />",
            ];

            foreach ($routePatterns as $pattern) {
                $quoted = preg_quote($pattern, '/'); // escape / and special chars
                $appContent = preg_replace("/$quoted\s*/", '', $appContent);
            }

            file_put_contents($appPath, $appContent);
            $this->info("Updated: {$appPath}");
        }

        // 4. Remove routes and controller import from api.php
        $apiPath = $parentBasePath . '/'. $this->backend_dir . '/routes/api.php';
        if (file_exists($apiPath)) {
            $apiContent = file_get_contents($apiPath);

            // Remove the controller import
            $controllerName = "{$cFeatureName}Controller";
            $importPattern = "/^use\s+App\\\\Http\\\\Controllers\\\\{$controllerName};\s*$/m";
            $apiContent = preg_replace($importPattern, '', $apiContent);

            // Remove the route group for this feature
            $routePrefix = $pFeatureName;

            // Build a regex to match the route group block
            // The block starts with: Route::controller({$controllerName}::class)->group(function() {
            // and contains Route::prefix('{$routePrefix}')->group(function() { ... });
            // and ends with })->middleware(['auth:sanctum']);
            // We will match from Route::controller... to the closing }); or })->middleware...;
            $routeBlockPattern = "/\n*Route::controller\(\s*{$controllerName}::class\s*\)->group\(function\(\)\s*{.*?Route::prefix\(\s*'{$routePrefix}'\s*\)->group\(function\(\)\s*{.*?}\);\s*}\)->middleware\(\s*\[\s*'auth:sanctum'\s*]\s*\);\n*/s";

            $apiContent = preg_replace($routeBlockPattern, '', $apiContent);

            // Clean up extra blank lines
            $apiContent = preg_replace("/\n{3,}/", "\n\n", $apiContent);

            file_put_contents($apiPath, $apiContent);
            $this->info("Updated: {$apiPath}");
        }
    }
}
