'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal, X, Search, MapPin } from 'lucide-react'
import type { SearchFilters as SearchFiltersType } from '@/lib/types'
import { popularCities, amenitiesList, universities } from '@/lib/mock-data'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  resultCount?: number
}

const propertyTypes = [
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'shared', label: 'Shared' },
  { value: 'residence', label: 'Residence' },
]

const bedroomOptions = [
  { value: '1', label: '1 bedroom' },
  { value: '2', label: '2 bedrooms' },
  { value: '3', label: '3+ bedrooms' },
]

export function SearchFilters({ filters, onFiltersChange, resultCount }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters)

  const updateLocalFilter = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const resetFilters = () => {
    const emptyFilters: SearchFiltersType = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length

  const togglePropertyType = (type: string) => {
    const current = localFilters.propertyType || []
    const updated = current.includes(type as any)
      ? current.filter((t) => t !== type)
      : [...current, type as any]
    updateLocalFilter('propertyType', updated.length > 0 ? updated : undefined)
  }

  const toggleAmenity = (amenity: string) => {
    const current = localFilters.amenities || []
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    updateLocalFilter('amenities', updated.length > 0 ? updated : undefined)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, description..."
            value={filters.query || ''}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value || undefined })}
            className="pl-10"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={filters.city || ''}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, city: value || undefined })
            }
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {popularCities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <Accordion type="multiple" defaultValue={['price', 'property', 'rooms']}>
                {/* Price Range */}
                <AccordionItem value="price">
                  <AccordionTrigger>Price Range</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="minRent" className="text-xs text-muted-foreground">
                          Min (MAD)
                        </Label>
                        <Input
                          id="minRent"
                          type="number"
                          placeholder="0"
                          value={localFilters.minRent || ''}
                          onChange={(e) =>
                            updateLocalFilter(
                              'minRent',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="maxRent" className="text-xs text-muted-foreground">
                          Max (MAD)
                        </Label>
                        <Input
                          id="maxRent"
                          type="number"
                          placeholder="2000"
                          value={localFilters.maxRent || ''}
                          onChange={(e) =>
                            updateLocalFilter(
                              'maxRent',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </div>
                    </div>
                    <Slider
                      value={[localFilters.minRent || 0, localFilters.maxRent || 2000]}
                      min={0}
                      max={2000}
                      step={50}
                      onValueChange={([min, max]) => {
                        updateLocalFilter('minRent', min > 0 ? min : undefined)
                        updateLocalFilter('maxRent', max < 2000 ? max : undefined)
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Property Type */}
                <AccordionItem value="property">
                  <AccordionTrigger>Property Type</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {propertyTypes.map((type) => (
                        <Button
                          key={type.value}
                          variant={
                            localFilters.propertyType?.includes(type.value as any)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => togglePropertyType(type.value)}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Rooms & Size */}
                <AccordionItem value="rooms">
                  <AccordionTrigger>Rooms & Size</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label className="text-sm font-medium">Bedrooms</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {bedroomOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={
                              localFilters.bedrooms?.includes(Number(option.value))
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              const current = localFilters.bedrooms || []
                              const num = Number(option.value)
                              const updated = current.includes(num)
                                ? current.filter((b) => b !== num)
                                : [...current, num]
                              updateLocalFilter('bedrooms', updated.length > 0 ? updated : undefined)
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="minSurface" className="text-xs text-muted-foreground">
                          Min m2
                        </Label>
                        <Input
                          id="minSurface"
                          type="number"
                          placeholder="0"
                          value={localFilters.minSurface || ''}
                          onChange={(e) =>
                            updateLocalFilter(
                              'minSurface',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="maxSurface" className="text-xs text-muted-foreground">
                          Max m2
                        </Label>
                        <Input
                          id="maxSurface"
                          type="number"
                          placeholder="100"
                          value={localFilters.maxSurface || ''}
                          onChange={(e) =>
                            updateLocalFilter(
                              'maxSurface',
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Amenities */}
                <AccordionItem value="amenities">
                  <AccordionTrigger>Amenities</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {amenitiesList.slice(0, 10).map((amenity) => (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity.id}
                            checked={localFilters.amenities?.includes(amenity.id)}
                            onCheckedChange={() => toggleAmenity(amenity.id)}
                          />
                          <Label htmlFor={amenity.id} className="text-sm font-normal">
                            {amenity.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* University */}
                <AccordionItem value="university">
                  <AccordionTrigger>Near University</AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <Select
                      value={localFilters.nearUniversity || ''}
                      onValueChange={(value) =>
                        updateLocalFilter('nearUniversity', value || undefined)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>
                            {uni}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                {/* Other Options */}
                <AccordionItem value="other">
                  <AccordionTrigger>Other Options</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="furnished"
                        checked={localFilters.furnished || false}
                        onCheckedChange={(checked) =>
                          updateLocalFilter('furnished', checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="furnished" className="text-sm font-normal">
                        Furnished only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={localFilters.verified || false}
                        onCheckedChange={(checked) =>
                          updateLocalFilter('verified', checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="verified" className="text-sm font-normal">
                        Verified listings only
                      </Label>
                    </div>
                    <div>
                      <Label htmlFor="availableFrom" className="text-sm font-normal">
                        Available from
                      </Label>
                      <Input
                        id="availableFrom"
                        type="date"
                        value={localFilters.availableFrom || ''}
                        onChange={(e) =>
                          updateLocalFilter('availableFrom', e.target.value || undefined)
                        }
                        className="mt-1"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <SheetFooter className="mt-6 flex gap-2">
              <Button variant="outline" onClick={resetFilters} className="flex-1 bg-transparent">
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={applyFilters} className="flex-1">
                Show {resultCount !== undefined ? `${resultCount} results` : 'results'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.city && (
            <Badge variant="secondary" className="gap-1">
              {filters.city}
              <button
                onClick={() => onFiltersChange({ ...filters, city: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.propertyType?.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    propertyType: filters.propertyType?.filter((t) => t !== type),
                  })
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.minRent || filters.maxRent) && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRent || 0} - {filters.maxRent || '2000+'} MAD
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, minRent: undefined, maxRent: undefined })
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="gap-1">
              Verified
              <button
                onClick={() => onFiltersChange({ ...filters, verified: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
