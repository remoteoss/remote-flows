import './App.css';
import { BasicCostCalculator } from './BasicCostCalculator';
import { CustomCostCalculator } from './CustomCostCalculator';

function App() {
  return (
    <>
      <CustomCostCalculator />
      <BasicCostCalculator />
    </>
  );
}

export default App;
