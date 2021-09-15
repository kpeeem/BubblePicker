import { useState, useRef } from "react";
import "./styles.css";
import Simulate from "./Simulate";
import hobbies from "./hobbies";

const portionSize = 20;

export default function App() {
  const [[leftCursor, rigthCursor], setCursor] = useState([0, portionSize]);
  const [active, setActive] = useState<string[]>([]);
  const activeRef = useRef<string[]>([]);
  function handleMore() {
    if (hobbies.length <= rigthCursor) {
      setCursor([0, portionSize]);
      return;
    }
    setCursor([rigthCursor, rigthCursor + portionSize]);
  }
  // function handleAdd(i: number = 1) {
  //   setCount(count + i);
  // }
  // function handleRemove(i: number = 1) {
  //   setCount(count - i);
  // }
  function handleSelect(items: string[]) {
    // setActive(items);
  }
  const items = hobbies.slice(leftCursor, rigthCursor);
  console.log(items);
  //Todo: mass on center/drag bubbles/ appear from sides
  return (
    <div className="App">
      <div className="header">
        <h1>Select Your Hobbies</h1>
        <p>Please choose a few things you are interested in.</p>
      </div>
      <div className="simulate">
        <Simulate items={items} onSelect={handleSelect} />
      </div>
      <div className="controls">
        <button onClick={() => handleMore()}>Load more</button>
        {/* <button onClick={() => handleAdd()}>Add</button> */}
        {/* <button onClick={() => handleRemove()}>Remove</button> */}
        {/* <button onClick={() => handleMore(10)}>Load 10</button> */}
        {/* <button onClick={() => handleRemove(10)}>Remove 10</button> */}
      </div>
    </div>
  );
}
