<?php
namespace App\Concerns;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TableDataCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        $query = $this->getQuery();
        
        $filters = (array) $request->input('filter', []);
        $fromToFields = $this->getQuery()->getModel()->fromTo ?? [];
        
        if ($target_fields !== "*") {
            foreach ($fromToFields as $fromToField) {
                \Log::info("Processing fromToField: " . json_encode($fromToField, JSON_PRETTY_PRINT));
                $target_fields = array_filter($target_fields, function($f) use ($fromToField) {
                    return $f !== "{$fromToField['key']}_from" && $f !== "{$fromToField['key']}_to";
                });
                if (!in_array($fromToField['key'], $target_fields)) {
                    $target_fields[] = $fromToField['key'];
                }
            }
        }
        
        $ignoreSliceKeys = $this->getQuery()->getModel()->ignoreSliceKeys ?? [];
        foreach ($ignoreSliceKeys as $ignoreSliceKey) {
            $target_fields = array_filter($target_fields, function($f) use ($ignoreSliceKey) {
                return $f !== $ignoreSliceKey;
            });
        }
        
        foreach ($filters as $field => $value) {
            if ($value === '' || $value === null) {
                continue;
            }
            
            $matchedFromTo = null;
            foreach ($fromToFields as $fromToField) {
                if ($field === "{$fromToField['key']}_from") {
                    $matchedFromTo = ['field' => $fromToField['key'], 'op' => '>=', "format" => $fromToField['format'] ?? null];
                    break;
                }
                if ($field === "{$fromToField['key']}_to") {
                    $matchedFromTo = ['field' => $fromToField['key'], 'op' => '<=', "format" => $fromToField['format'] ?? null];
                    break;
                }
            }
            
            if ($matchedFromTo) {
                                // If format is defined, assume the user is providing yyyy-mm (month-level filter)
                if (!empty($matchedFromTo['format'])) {

                    // Create DateTime object based on the provided format
                    $dt = \DateTime::createFromFormat($matchedFromTo['format'], $value);

                    if ($dt !== false) {
                        $formatted = $dt->format("Y-m-01"); // first day of the month

                        if ($matchedFromTo['op'] === '>=') {
                            // admission_day >= first day of given month
                            $query->where($matchedFromTo['field'], '>=', $formatted);

                        } elseif ($matchedFromTo['op'] === '<=') {
                            // admission_day < first day of the next month
                            $nextMonth = $dt->modify('+1 month')->format("Y-m-01");
                            $query->where($matchedFromTo['field'], '<', $nextMonth);
                        }

                    } else {
                        // Fallback: if parsing fails, do normal comparison
                        $query->where($matchedFromTo['field'], $matchedFromTo['op'], $value);
                    }

                } else {
                    // No format defined → regular comparison
                    $query->where($matchedFromTo['field'], $matchedFromTo['op'], $value);
                }
            } else {
                // Try exact match first, fallback to LIKE for text search
                if (is_numeric($value) || strlen($value) <= 2) {
                    // Short values or numbers: use exact match
                    $query->where($field, $value);
                } else {
                    // Longer text values: use LIKE for partial matching
                    $query->where(function ($q) use ($field, $value) {
                        $q->whereRaw("CAST(" . $q->getGrammar()->wrap($field) . " AS TEXT) LIKE ?", ["%{$value}%"]);
                    });
                }
            }
        }
        if (method_exists($this, 'modifyTableQuery') && !$filters) {
            $this->modifyTableQuery($query, $request);
        }

        if (method_exists($this, 'modifyTableQueryOrder')) {
            $this->modifyTableQueryOrder($query, $request);
        } else {
            $query->orderBy('id');
        }
        $records = $query->paginate($limit, $target_fields, 'page', $page);
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