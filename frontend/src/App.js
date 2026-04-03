import React, { useState } from "react";
import InputForm from "./pages/InputForm";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleAnalysisComplete = (result, inputData) => {
    setAnalysisResult(result);
    setFormData(inputData);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setFormData(null);
  };

  return (
    <div className="app">
      {!analysisResult ? (
        <InputForm onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <Dashboard
          result={analysisResult}
          formData={formData}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
