import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function BasicDatePicker() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Choisir une date"
        slotProps={{
          textField: {
            fullWidth: true,
            sx: {
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#fff' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
              '& .MuiSvgIcon-root': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#fff' },
                '&:hover fieldset': { borderColor: '#fff' },
                '&.Mui-focused fieldset': { borderColor: '#fff' },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}