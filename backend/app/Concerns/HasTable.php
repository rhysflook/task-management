<?php

namespace App\Concerns;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TableDataCollection;
use Illuminate\Http\Request;

trait HasTable
{
    public function getPage(Request $request)
    {
        return response()->json($this->generateQueryFromRequest($request));
    }

    public function generateQueryFromRequest(Request $request)
    {
        $page = $request->get('page', 1);
        $limit = $request->get('per_page', 5);
        $target_fields = $request->has('fields') ? ['id', ...explode(",", $request->get('fields'))] : "*";
        $records = $this->getQuery()->orderBy('id')
            ->paginate($limit, $target_fields, 'page', $page);

        return $this->getCollection($records);
    }

    public function getQuery()
    {
        $controllerClass = class_basename(static::class);
        $modelClass = 'App\\Models\\' . str_replace('Controller', '', $controllerClass);
        return $modelClass::query();
    }

    public function getCollection($records)
    {
        $controllerClass = class_basename(static::class);
        $conllectionClass = 'App\\Http\\Resources\\' . str_replace('Controller', '', $controllerClass) . 'Collection';
        if (class_exists($conllectionClass)) {
            return new $conllectionClass($records);
        }
    }
}
