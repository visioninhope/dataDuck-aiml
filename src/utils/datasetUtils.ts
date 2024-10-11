// src/utils/datasetUtils.ts

import { useState, useEffect } from 'react';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  fileName: string;
  uploadDate: string;
}

const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Sales Data 2023',
    description: 'Annual sales data for all products',
    fileName: 'sales_data_2023.csv',
    uploadDate: '2023-12-31',
  },
  {
    id: '2',
    name: 'Customer Survey',
    description: 'Results from the annual customer satisfaction survey',
    fileName: 'customer_survey_2023.json',
    uploadDate: '2023-11-15',
  },
  {
    id: '3',
    name: 'Product Inventory',
    description: 'Current inventory levels for all products',
    fileName: 'inventory_2024.xlsx',
    uploadDate: '2024-01-05',
  },
];

export const useDatasets = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    // In a real application, this would be an API call
    setDatasets(mockDatasets);
  }, []);

  return datasets;
};

export const getDatasetById = (id: string): Dataset | undefined => {
  return mockDatasets.find(dataset => dataset.id === id);
};

export const getDatasetContent = async (fileName: string): Promise<string> => {
  // In a real application, this would fetch the actual file content
  // For now, we'll return mock content based on the file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return 'Date,Product,Sales\n2023-01-01,Widget A,100\n2023-01-02,Widget B,150\n2023-01-03,Widget C,200';
    case 'json':
      return JSON.stringify({
        "questions": [
          {"id": 1, "text": "How satisfied are you with our product?", "average_score": 4.2},
          {"id": 2, "text": "How likely are you to recommend our product?", "average_score": 4.5},
          {"id": 3, "text": "How likely are you to recommend our product?", "average_score": 4.5},
          {"id": 4, "text": "How likely are you to recommend our product?", "average_score": 4.5},
          {"id": 5, "text": "How likely are you to recommend our product?", "average_score": 4.5}
        ]
      }, null, 2);
    case 'xlsx':
      return 'Product,Quantity\nWidget A,500\nWidget B,750\nWidget C,1000';
    default:
      return 'Unsupported file format';
  }
};