<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $controllerPath = app_path('Http/Controllers');
        $controllers = File::allFiles($controllerPath);

        foreach ($controllers as $controllerFile) {
            $classPath = 'App\\Http\\Controllers\\' . str_replace(['/', '.php'], ['\\', ''], $controllerFile->getRelativePathname());

            if (!class_exists($classPath)) {
                continue;
            }

            $reflection = new \ReflectionClass($classPath);

            if ($reflection->isAbstract()) continue;

            if (in_array(\App\Concerns\HasTable::class, class_uses($classPath))) {

                $basename = class_basename($classPath); // e.g. ProjectController
                $resource = \Str::kebab(str_replace('Controller', '', $basename)); // "project" -> kebab-case
                $uri = \Str::plural($resource); // "projects"

                Route::get("api/$uri/tableData", [$classPath, 'getPage']);
            }
        }
    }
}
