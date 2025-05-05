import { useEffect, useRef, useState } from 'react';

function TaskEditor({ task, onChange, onEnterBelow, onTabIn }) {
  const [value, setValue] = useState(task.name);
  const inputRef = useRef();

  useEffect(() => {
    setValue(task.name);
  }, [task.name]);

  return (
    <input
      ref={inputRef}
      className="border p-1 w-full"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onEnterBelow?.();
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          onTabIn?.();
        }
      }}
    />
  );
}

export default TaskEditor;
