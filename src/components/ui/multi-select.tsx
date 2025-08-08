import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Option {
  label: string
  value: string
  price?: number
  serviceCharge?: number
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option))
  }

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      handleUnselect(option)
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            onClick={() => setOpen(!open)}
          >
            <div className="flex gap-1 flex-wrap">
              {selected.length > 0 ? (
                selected.slice(0, 2).map((item) => {
                  const option = options.find((option) => option.value === item)
                  return (
                    <Badge
                      variant="secondary"
                      key={item}
                      className="mr-1 mb-1 bg-purple-500/20 text-purple-300 border-purple-500/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnselect(item)
                      }}
                    >
                      {option?.label}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(item)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUnselect(item)
                        }}
                      >
                        <X className="h-3 w-3 text-purple-300 hover:text-purple-200" />
                      </button>
                    </Badge>
                  )
                })
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
              {selected.length > 2 && (
                <Badge variant="secondary" className="mr-1 mb-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  +{selected.length - 2} more
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-slate-800 border-slate-700" align="start">
          <Command className="bg-slate-800">
            <CommandInput placeholder="Search vaccines..." className="text-white" />
            <CommandList>
              <CommandEmpty className="text-slate-400">No vaccines found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer text-white hover:bg-slate-700 aria-selected:bg-slate-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {option.price && (
                        <div className="text-sm text-slate-400">
                          ₹{option.price.toFixed(2)}
                          {option.serviceCharge && option.serviceCharge > 0 && (
                            <span className="ml-1">+ ₹{option.serviceCharge.toFixed(2)} service</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}