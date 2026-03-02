<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CreateFrontendFeature extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-frontend-feature';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected $backend_dir;
    protected $frontend_dir;

    protected $stubLocations;

    public function __construct()
    {
        parent::__construct();

        $this->backend_dir = env('BACKEND_DIR', 'backend');
        $this->frontend_dir = env('FRONTEND_DIR', 'frontend');

        $this->stubLocations = [
            'model' => [
                'src_path' => "{$this->backend_dir}/app/Models/Stub.stub",
                'dest_path' => "{$this->backend_dir}/app/Models/{cFeatureName}.php"
            ],
            'request' => [
                'src_path' => "{$this->backend_dir}/app/Http/Requests/StubRequest.stub",
                'dest_path' => "{$this->backend_dir}/app/Http/Requests/{cFeatureName}Request.php"
            ],
            'controller' => [
                'src_path' => "{$this->backend_dir}/app/Http/Controllers/StubController.stub",
                'dest_path' => "{$this->backend_dir}/app/Http/Controllers/{cFeatureName}Controller.php"
            ],
            'resource' => [
                'src_path' => "{$this->backend_dir}/app/Http/Resources/StubResource.stub",
                'dest_path' => "{$this->backend_dir}/app/Http/Resources/{cFeatureName}Resource.php"
            ],
            'collection' => [
                'src_path' => "{$this->backend_dir}/app/Http/Resources/StubCollection.stub",
                'dest_path' => "{$this->backend_dir}/app/Http/Resources/{cFeatureName}Collection.php"
            ],
            'seeder' => [
                'src_path' => "{$this->backend_dir}/database/seeders/StubSeeder.stub",
                'dest_path' => "{$this->backend_dir}/database/seeders/{cFeatureName}Seeder.php"
            ],
            'migration' => [
                'src_path' => "{$this->backend_dir}/database/migrations/migration_stub.stub",
                'dest_path' => "{$this->backend_dir}/database/migrations/{dateTime}_create_{pFeatureName}_table.php"
            ],
            'createPage' => [
                'src_path' => "{$this->frontend_dir}/src/pages/stubs/CreateStub.stub",
                'dest_path' => "{$this->frontend_dir}/src/pages/{pFeatureName}/Create{cFeatureName}.jsx"
            ],
            'editPage' => [
                'src_path' => "{$this->frontend_dir}/src/pages/stubs/EditStub.stub",
                'dest_path' => "{$this->frontend_dir}/src/pages/{pFeatureName}/Edit{cFeatureName}.jsx"
            ],
            'dashboard' => [
                'src_path' => "{$this->frontend_dir}/src/pages/stubs/StubDashboard.stub",
                'dest_path' => "{$this->frontend_dir}/src/pages/{pFeatureName}/{cFeatureName}Dashboard.jsx"
            ],
            'listPage' => [
                'src_path' => "{$this->frontend_dir}/src/pages/stubs/ListStub.stub",
                'dest_path' => "{$this->frontend_dir}/src/pages/{pFeatureName}/List{cFeatureName}s.jsx"
            ],
            'api' => [
                'src_path' => "{$this->frontend_dir}/src/services/api.stub",
                'dest_path' => "{$this->frontend_dir}/src/services/{featureName}.js"
            ],
            'store' => [
                'src_path' => "{$this->frontend_dir}/src/stores/reducers/slice.stub",
                'dest_path' => "{$this->frontend_dir}/src/stores/reducers/{featureName}Slice.js"
            ],
        ];
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $pFeatureName = $this->ask('Enter pFeatureName (e.g. unitMaps)');
        $featureName = \Illuminate\Support\Str::singular($pFeatureName);
        $cFeatureName = ucfirst($featureName);
        $relationships = $this->ask('Enter relationships (comma separated)');
        $dateTime = date('Y_m_d_His');

        // Get parent of base_path
        $parentBasePath = dirname(base_path());

        foreach ($this->stubLocations as $key => $paths) {
            $stubPath = $parentBasePath . DIRECTORY_SEPARATOR . $paths['src_path'];
            $stub = file_get_contents($stubPath);

            $replacements = [
                '{featureName}' => $featureName,
                '{cFeatureName}' => $cFeatureName,
                '{pFeatureName}' => $pFeatureName,
                '{relationships}' => $relationships,
                '{dateTime}' => $dateTime,
            ];

            if ($key === 'model' && !empty($relationships)) {
                $relationshipMethods = '';
                $relations = explode(',', $relationships);
                foreach ($relations as $relation) {
                    $relation = trim($relation);
                    $methodName = lcfirst($relation);
                    $relationshipMethods .= "\n    public function {$methodName}()\n    {\n        return \$this->hasMany({$relation}::class);\n    }\n";
                }
                $replacements['{relationshipMethods}'] = $relationshipMethods;
            }

            $newContent = str_replace(array_keys($replacements), array_values($replacements), $stub);

            $destPath = $parentBasePath . DIRECTORY_SEPARATOR . str_replace(array_keys($replacements), array_values($replacements), $paths['dest_path']);
            $destDir = dirname($destPath);

            if (!is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }

            file_put_contents($destPath, $newContent);
            $this->info("Created: {$destPath}");
        }

        // Update App.jsx to add new routes and imports
        $appPath = $parentBasePath . DIRECTORY_SEPARATOR . $this->frontend_dir . '/src/App.jsx';
        $appContent = file_get_contents($appPath);

        // Prepare import statements
        $dashboardImport = "import {$cFeatureName}Dashboard from \"./pages/{$pFeatureName}/{$cFeatureName}Dashboard\";";
        $createImport = "import Create{$cFeatureName} from \"./pages/{$pFeatureName}/Create{$cFeatureName}\";";
        $editImport = "import Edit{$cFeatureName} from \"./pages/{$pFeatureName}/Edit{$cFeatureName}\";";
        $listImport = "import List{$cFeatureName}s from \"./pages/{$pFeatureName}/List{$cFeatureName}s\";";

        // Insert imports after last import
        $appContent = preg_replace(
            '/(import\s+[^\n]+;\s*)+/',
            "$0\n{$dashboardImport}\n{$createImport}\n{$editImport}\n{$listImport}\n",
            $appContent,
            1
        );

        // Prepare route entries
        $routes = <<<ROUTES
        <Route path="/{$pFeatureName}" element={RouteElementWrapper("{$pFeatureName}", <UserRoute><{$cFeatureName}Dashboard /></UserRoute>)} />
        <Route path="/{$pFeatureName}/list" element={RouteElementWrapper("{$pFeatureName}", <UserRoute><List{$cFeatureName}s /></UserRoute>)} />
        <Route path="/{$pFeatureName}/create" element={RouteElementWrapper("{$pFeatureName}", <UserRoute><Create{$cFeatureName} /></UserRoute>)} />
        <Route path="/{$pFeatureName}/:id/edit" element={RouteElementWrapper("{$pFeatureName}", <UserRoute><Edit{$cFeatureName} /></UserRoute>)} />
        ROUTES;

        // Insert routes before closing </Routes>
        $appContent = preg_replace(
            '/(<Route\s+element={<MainLayout\s*\/>}>\s*)(.*?)(\s*<\/Route>)/s',
            "$1$2\n{$routes}\n$3",
            $appContent
        );

        file_put_contents($appPath, $appContent);
        $this->info("Updated: {$appPath}");

        // Update api.php to add new routes
        $apiPath = $parentBasePath . DIRECTORY_SEPARATOR . $this->backend_dir . '/routes/api.php';
        $apiContent = file_get_contents($apiPath);

        $controllerName = "{$cFeatureName}Controller";
        $routePrefix = $pFeatureName;

        // Add import for controller if not already present
        $importStatement = "use App\\Http\\Controllers\\{$controllerName};";
        if (strpos($apiContent, $importStatement) === false) {
            // Insert after opening <?php tag
            $apiContent = preg_replace(
                '/<\?php\s*/',
                "<?php\n{$importStatement}\n",
                $apiContent,
                1
            );
        }

        $routeBlock = <<<ROUTE

        Route::controller({$controllerName}::class)->group(function() {
        Route::prefix('{$routePrefix}')->group(function() {
        Route::get('/formData', 'getFormData');
        Route::get('/{id}/edit', 'getFormData');
        Route::put('/{id}/save', 'EditRecord');
        Route::get('/{{$featureName}}', 'show');
        Route::get('/{relationship}/options', 'getOptionsJson');
        Route::post('/create', 'createRecord');
        Route::delete('/{id}', 'deleteRecord');
        });
        })->middleware(['auth:sanctum']);

        ROUTE;

        // Insert before last closing PHP tag or at end of file
        if (strpos($apiContent, '?>') !== false) {
            $apiContent = str_replace('?>', $routeBlock . "\n?>", $apiContent);
        } else {
            $apiContent .= "\n" . $routeBlock . "\n";
        }

        file_put_contents($apiPath, $apiContent);
        $this->info("Updated: {$apiPath}");

        // Update nav.config.json to add the new feature to the sidebar
        $navPath = $parentBasePath . DIRECTORY_SEPARATOR . $this->frontend_dir . '/src/features/main/nav.config.json';
        if (!file_exists($navPath)) {
            // create with empty array if missing
            file_put_contents($navPath, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        }

        // Read nav.config.json with UTF-8 encoding
        $navContent = file_get_contents($navPath);
        // Ensure the content is interpreted as UTF-8
        if (!mb_check_encoding($navContent, 'UTF-8')) {
            $navContent = mb_convert_encoding($navContent, 'UTF-8', 'auto');
        }
        $navItems = json_decode($navContent, true);
        if (!is_array($navItems)) {
            $navItems = [];
        }

        // Determine label (capitalize plural) and base path
        $label = ucfirst($pFeatureName);
        $path = '/' . $pFeatureName;

        // Only add if not already present
        $exists = false;
        foreach ($navItems as $item) {
            if (isset($item['path']) && $item['path'] === $path) {
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            $navItems[] = [
                'label' => $label,
                'path' => $path,
            ];
            // keep deterministic ordering by label
            usort($navItems, function ($a, $b) {
                return strcmp($a['label'], $b['label']);
            });
            // Write nav.config.json with UTF-8 encoding and unescaped unicode
            file_put_contents($navPath, json_encode($navItems, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            $this->info("Updated: {$navPath}");
        } else {
            $this->info("No changes to: {$navPath} (entry already exists)");
        }
    }
}
