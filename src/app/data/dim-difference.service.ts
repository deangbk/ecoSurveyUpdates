import { Injectable } from '@angular/core';
import * as Models from '../data/data-model-new';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class DimDifferenceService {

  findLargestDifference(data: number[], dataYear: number[]): { largestDifference: number; largestDifferenceIndex: number, largestNegativeDifference: number, largestNegativeDifferenceIndex: number } {
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

    return { largestDifference, largestDifferenceIndex, largestNegativeDifference, largestNegativeDifferenceIndex };
  }
  ///possibly sort data again, just in case it is ever changed
  public findLargestDifferenceNew(data: Models.DimComparisonItem[], queryType: string) {
    var largestDif: Models.DimComparisonItem;
    var size = data.length;

    switch (queryType) {
      case "max": largestDif = data[0];
        break;
      case "min": largestDif = data[size - 1];
        break;
      case "top": largestDif = largestDif = data.reduce((prev, current) => {
        return (prev.scoreR2 > current.scoreR2) ? prev : current;
      });
        break;
      case "bot": largestDif = largestDif = data.reduce((prev, current) => {
        return (prev.scoreR2 < current.scoreR2) ? prev : current;
      });
        break
      default: largestDif = data[0];
        break;
    }
    var itemsWithLargestDifference: Models.DimComparisonItem[];
    if (queryType === "top" || queryType === "bot") {
      itemsWithLargestDifference = data.filter(item => item.scoreR2 === largestDif.scoreR2);
    }
    else {
      itemsWithLargestDifference = data.filter(item => item.difference === largestDif.difference);
    }



    return itemsWithLargestDifference;
  }
  public findTopScores(data: Models.DimComparisonItem[]) {
    var largestDif: Models.DimComparisonItem;
    var size = data.length;
    var sdata = [...data];
    var sortedData = sdata.sort((a, b) => b.scoreR2 - a.scoreR2);
    var topThreeScores = sortedData.slice(0, 3);
    var thirdScore = topThreeScores[2].scoreR2;
    var extraItems = data.filter(item => item.scoreR2 === thirdScore && item.DimensionName !== topThreeScores[0].DimensionName && item.DimensionName !== topThreeScores[1].DimensionName && item.DimensionName !== topThreeScores[2].DimensionName);
    // add the extra items to the topThreeScores
    topThreeScores.push(...extraItems);

    /// assign rankings to the scores

    let rank = 0;
    let lastScore = null;

    // for (let item of topThreeScores) {
    //   if (item.scoreR2 !== lastScore) {
    //     rank++;
    //   }

    //   item.rank = rank;
    //   lastScore = item.scoreR2;
    // }

    for (let i = 0; i < topThreeScores.length; i++) {
      let item = topThreeScores[i];
      if (item.scoreR2 !== lastScore) {
        rank = i + 1;
      }

      item.rank = rank;
      lastScore = item.scoreR2;
    }




    return topThreeScores;
  }
  public findBottomScores(data: Models.DimComparisonItem[]) {
    var sdata = [...data];
    var sortedData = sdata.sort((a, b) => a.scoreR2 - b.scoreR2);
    var bottomThreeScores = sortedData.slice(0, 3);
    var thirdScore = bottomThreeScores[2].scoreR2;
    var extraItems = data.filter(item => item.scoreR2 === thirdScore && item.DimensionName !== bottomThreeScores[0].DimensionName && item.DimensionName !== bottomThreeScores[1].DimensionName && item.DimensionName !== bottomThreeScores[2].DimensionName);
    // add the extra items to the topThreeScores
    bottomThreeScores.push(...extraItems);
    /// assign rankings to the scores

    let rank = 0;
    let lastScore = null;

    // for (let item of bottomThreeScores) {
    //   if (item.scoreR2 !== lastScore) {
    //     rank++;
    //   }
    //   item.rank = rank;
    //   lastScore = item.scoreR2;
    // }
    for (let i = 0; i < bottomThreeScores.length; i++) {
      let item = bottomThreeScores[i];
      if (item.scoreR2 !== lastScore) {
        rank = i + 1;
      }

      item.rank = rank;
      lastScore = item.scoreR2;
    }


    return bottomThreeScores;
  }

  ////create a table that correctly maps old dimensions to new dimensions
  public createDimTable(oldData: Models.OldDataTable[], dataDim: Models.ResultDimension[]) {
    let result: Models.DimComparisonItem[] = [];

    dataDim.forEach(dimItem => {
      let oldDataItem = oldData.find(item => item.dim === dimItem.dimension_id);

      if (oldDataItem) {
        let difference = dimItem.score_avg_percent - oldDataItem.score;
        let comparisonItem: Models.DimComparisonItem = {
          DimensionName: dimItem.dimension_name,
          scoreR2: +dimItem.score_avg_percent.toFixed(AppConfig.decPlaces),//dimItem.score_avg_percent,//
          scoreR1: +oldDataItem.score.toFixed(AppConfig.decPlaces),// oldDataItem.score,//
          difference: +difference.toFixed(AppConfig.decPlaces),//+(dimItem.score_avg_percent - oldDataItem.score).toFixed(AppConfig.decPlaces), //dimItem.score_avg_percent - oldDataItem.score,// 
        };

        result.push(comparisonItem);
      }
    });

    return result;

  }

}



//// old function use newer one below
export class BottomScores {
  bot3(data: number[]): { indicesOfBottom3Scores: number[]; bottom3Scores: number[], top3Scores: number[], indicesOfTop3Scores: number[] } {
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



    return { indicesOfBottom3Scores, bottom3Scores, top3Scores, indicesOfTop3Scores };
  }



}

