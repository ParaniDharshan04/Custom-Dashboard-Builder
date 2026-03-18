import { HexColorPicker } from 'react-colorful';
import { useState, useRef, useEffect } from 'react';
import { isValidHex } from '../../utils/validators';

export default function ColorPicker({ color, onChange, label }) {
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(color || '#54bd95');
  const pickerRef = useRef(null);

  useEffect(() => {
    setHexInput(color || '#54bd95');
  }, [color]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (isValidHex(val)) {
      onChange(val);
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer transition hover:border-gray-400"
          style={{ backgroundColor: color || '#54bd95' }}
          id="color-picker-swatch"
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          placeholder="#54bd95"
          className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 ${
            isValidHex(hexInput) ? 'border-gray-200' : 'border-red-300'
          }`}
          id="color-picker-hex-input"
        />
      </div>
      {!isValidHex(hexInput) && hexInput.length > 0 && (
        <p className="text-xs text-red-500 mt-1">Invalid hex color</p>
      )}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white p-3 rounded-xl shadow-xl border border-gray-100">
          <HexColorPicker
            color={color || '#54bd95'}
            onChange={(newColor) => {
              setHexInput(newColor);
              onChange(newColor);
            }}
          />
        </div>
      )}
    </div>
  );
}
