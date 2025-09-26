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


    protected $stubLocations = [
        'model' => ['src_path' => 'backend/app/Models/Stub.stub', 'dest_path' => 'backend/app/Models/{cFeatureName}.php'],
        'request' => ['src_path' => 'backend/app/Http/Requests/StubRequest.stub', 'dest_path' => 'backend/app/Http/Requests/{cFeatureName}Request.php'],
        'controller' => ['src_path' => 'backend/app/Http/Controllers/StubController.stub', 'dest_path' => 'backend/app/Http/Controllers/{cFeatureName}Controller.php'],
        'resource' => ['src_path' => 'backend/app/Http/Resources/StubResource.stub', 'dest_path' => 'backend/app/Http/Resources/{cFeatureName}Resource.php'],
        'collection' => ['src_path' => 'backend/app/Http/Resources/StubCollection.stub', 'dest_path' => 'backend/app/Http/Resources/{cFeatureName}Collection.php'],
        'seeder' => ['src_path' => 'backend/database/seeders/StubSeeder.stub', 'dest_path' => 'backend/database/seeders/{cFeatureName}Seeder.php'],
        'migration' => ['src_path' => 'backend/database/migrations/migration_stub.stub', 'dest_path' => 'backend/database/migrations/{dateTime}_create_{pFeatureName}_table.php'],
        'createPage' => ['src_path' => 'frontend/src/pages/stubs/CreateStub.stub', 'dest_path' => 'frontend/src/pages/{pFeatureName}/Create{cFeatureName}.jsx'],
        'editPage' => ['src_path' => 'frontend/src/pages/stubs/EditStub.stub', 'dest_path' => 'frontend/src/pages/{pFeatureName}/Edit{cFeatureName}.jsx'],
        'dashboard' => ['src_path' => 'frontend/src/pages/stubs/StubDashboard.stub', 'dest_path' => 'frontend/src/pages/{pFeatureName}/{cFeatureName}Dashboard.jsx'],
        'listPage' => ['src_path' => 'frontend/src/pages/stubs/ListStub.stub', 'dest_path' => 'frontend/src/pages/{pFeatureName}/List{cFeatureName}s.jsx'],
        'api' => ['src_path' => 'frontend/src/services/api.stub', 'dest_path' => 'frontend/src/services/{featureName}.js'],
        'store' => ['src_path' => 'frontend/src/stores/reducers/slice.stub', 'dest_path' => 'frontend/src/stores/reducers/{featureName}Slice.js'],
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $pFeatureName = $this->ask('Enter pFeatureName');
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
        $appPath = $parentBasePath . DIRECTORY_SEPARATOR . 'frontend/src/App.jsx';
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
        <Route path="/{$pFeatureName}" element={<UserRoute><{$cFeatureName}Dashboard /></UserRoute>} />
        <Route path="/{$pFeatureName}/list" element={<UserRoute><List{$cFeatureName}s /></UserRoute>} />
        <Route path="/{$pFeatureName}/create" element={<UserRoute><Create{$cFeatureName} /></UserRoute>} />
        <Route path="/{$pFeatureName}/:id/edit" element={<UserRoute><Edit{$cFeatureName} /></UserRoute>} />
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
        $apiPath = $parentBasePath . DIRECTORY_SEPARATOR . 'backend/routes/api.php';
        $apiContent = file_get_contents($apiPath);

        $controllerName = "{$cFeatureName}Controller";
        $routePrefix = strtolower($pFeatureName);

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
    }
}
