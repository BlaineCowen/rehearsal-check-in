import React, { useState } from 'react';

function Checkbox() {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
    console.log("Checked: " + event.target.checked);
    
};

  return (
    <div className='flex w-full justify-center pt-16'>
      <h1 className="text-l font-bold text-center inline justify-center pb-10 font-sans">Red Rhythm?</h1>
      <input 
        type="checkbox" 
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="w-1/12 h-6 px-4 text-sm font-semibold rounded-lg shadow-lg inline-block dark:bg-neutral-800 dark:text-neutral-100" 
      />
    </div>
  );
}

export default Checkbox;