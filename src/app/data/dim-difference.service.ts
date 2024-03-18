import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DimDifferenceService { findLargestDifference(data: number[], dataYear: number[]): { largestDifference: number; largestDifferenceIndex: number, largestNegativeDifference: number, largestNegativeDifferenceIndex: number} {
  if (data.length !== dataYear.length) {
    throw new Error('Arrays must have the same length');
  }

  let largestDifference = 0;
  let largestNegativeDifference = 0;
  let largestDifferenceIndex = -1;
  let largestNegativeDifferenceIndex = -1;

  for (let i = 0; i < data.length; i++) {
    const difference = data[i] - dataYear[i];

    if (difference > largestDifference) {
      largestDifference = difference;
      largestDifferenceIndex = i;
    }

     // Check for the largest negative difference
    if (difference < largestNegativeDifference) {
       largestNegativeDifference = difference;
       largestNegativeDifferenceIndex = i;
     }
  }

  return { largestDifference, largestDifferenceIndex,largestNegativeDifference, largestNegativeDifferenceIndex};
}
}

export class BottomScores { bot3(data: number[]): { indicesOfBottom3Scores: number[]; bottom3Scores: number[], top3Scores: number[], indicesOfTop3Scores: number[]} {
  let sortedData = [...data];

  // Sort the array in ascending order
  sortedData.sort((a, b) => a - b);
  
  // Get the bottom 3 scores by slicing the sorted array
  let bottom3Scores = sortedData.slice(0, 3);
  
  // Get the indices of the bottom 3 scores in the original array
  let indicesOfBottom3Scores = bottom3Scores.map(score => data.indexOf(score));

// Assuming 'data' is your array of scores
let sortedDataDesc = [...data];

// Sort the array in descending order for top scores
sortedDataDesc.sort((a, b) => b - a);

// Get the top 3 scores by slicing the sorted array
let top3Scores = sortedDataDesc.slice(0, 3);

// Get the indices of the top 3 scores in the original array
let indicesOfTop3Scores = top3Scores.map(score => data.indexOf(score));

  

  return { indicesOfBottom3Scores, bottom3Scores, top3Scores, indicesOfTop3Scores};
}
}

