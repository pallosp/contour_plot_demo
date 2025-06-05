import {Button, Checkbox, FormControlLabel, TextField, Typography} from '@mui/material';
import {useEffect, useRef} from 'preact/hooks';

export function FunctionButton(props: {text: string; selected: boolean; onclick: () => void}) {
  return (
    <Button variant={props.selected ? 'contained' : 'outlined'} onClick={props.onclick}>
      <Typography sx={{textTransform: 'none', whiteSpace: 'nowrap'}}>{props.text}</Typography>
    </Button>
  );
}

export function ShowEdgesCheckbox(props: {setShowEdges: (checked: boolean) => void}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{height: '36px'}}
          onChange={(e) => props.setShowEdges((e.currentTarget as HTMLInputElement).checked)}
        />
      }
      label="Show edges"
      sx={{margin: 0}}
    />
  );
}

export function PixelSizeInput(props: {
  pixelSizeExponent: number;
  setPixelSizeExponent: (size: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    const input = inputRef.current!;
    input.onchange = () => {
      let size = +input.value;
      if (size < -2 || size > 9 || !Number.isInteger(size)) {
        size = props.pixelSizeExponent;
      }
      props.setPixelSizeExponent(size);
    };
  });

  return (
    <FormControlLabel
      label="Pixel size: 2^"
      labelPlacement="start"
      control={
        <TextField
          inputRef={inputRef}
          type="number"
          value={props.pixelSizeExponent}
          variant="outlined"
          slotProps={{htmlInput: {min: -2, max: 9, step: 1}}}
          sx={{'& .MuiInputBase-input': {height: '36px', boxSizing: 'border-box'}}}
        />
      }
      sx={{margin: 0}}
    ></FormControlLabel>
  );
}
