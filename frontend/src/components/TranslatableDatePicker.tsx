import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es, pt, fr, de, it, zhCN, ja, ko, ru } from 'date-fns/locale';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';

interface TranslatableDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export const TranslatableDatePicker: React.FC<TranslatableDatePickerProps> = ({
  value,
  onChange,
  placeholder,
  className
}) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  // Obtener el locale correspondiente - MEMOIZADO
  const locale = useMemo(() => {
    switch (i18n.language) {
      case 'es':
        return es;
      case 'pt':
        return pt;
      case 'fr':
        return fr;
      case 'de':
        return de;
      case 'it':
        return it;
      case 'zh-CN':
        return zhCN;
      case 'ja':
        return ja;
      case 'ko':
        return ko;
      case 'ru':
        return ru;
      case 'ar':
        // Árabe no tiene locale en date-fns, usar inglés
        return undefined;
      default:
        return undefined; // Inglés por defecto
    }
  }, [i18n.language]);

  // Formatear la fecha según el idioma - MEMOIZADO
  const formatDate = useMemo(() => {
    return (date: Date) => {
      return format(date, 'dd/MM/yyyy', { locale });
    };
  }, [locale]);

  // ClassNames memoizados para evitar recreaciones
  const dayPickerClassNames = useMemo(() => ({
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium text-white",
    nav: "space-x-1 flex items-center",
    nav_button: "h-7 w-7 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors",
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-gray-300 rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-blue-600 [&:has([aria-selected])]:text-white focus-within:relative focus-within:z-20",
    day: "h-9 w-9 p-0 font-normal text-white hover:bg-gray-700 rounded-md transition-colors",
    day_range_end: "day-range-end",
    day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
    day_today: "bg-gray-700 text-white font-semibold",
    day_outside: "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-500 aria-selected:opacity-30",
    day_disabled: "text-gray-500 opacity-50",
    day_range_middle: "aria-selected:bg-gray-700 aria-selected:text-white",
    day_hidden: "invisible",
  }), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 text-white hover:from-gray-700 hover:to-gray-600 hover:text-white focus:from-gray-700 focus:to-gray-600 focus:text-white transition-all duration-200 shadow-md hover:shadow-lg",
            !value && "text-gray-400",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4 text-gray-300" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-600 shadow-2xl backdrop-blur-sm" 
        align="start"
      >
        <div className="p-6">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            locale={locale}
            initialFocus
            className="text-white"
            classNames={dayPickerClassNames}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
