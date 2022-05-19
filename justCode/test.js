
const maxSquare = matrix => {
   const height = matrix.length;
   const width = matrix[0].length;
   let sideRightMatrix = (new Array(height)).fill((new Array(width)).fill(0));
   let sideDownMatrix = (new Array(height)).fill((new Array(width)).fill(0));
   for(let i = 0; i<height; i++) {
     for(let j = 0; j<width; j++) {
       let downCount = 0;
       for(let line = i + 1; line <height; line++) {
         if(matrix[line][j]){
           downCount++
         } else {
           break;
         }
       }
       let rightCount = 0;
       for(let col = j+1; col < width; col++) {
         if(matrix[i][col]){
           rightCount++
         } else {
           break;
         }
       }
       console.log(i, j, rightCount)
       sideRightMatrix[i][j] = rightCount;
       sideDownMatrix[i][j] = downCount;
     }
   }
   console.log(sideRightMatrix);
   const validSquareSide = [];
   for(let i = 0; i<height; i++) {
     for(let j = 0; j<width; j++) {
       const side = Math.min(sideRightMatrix[i][j], sideDownMatrix[i][j]);
       const bottomSide = sideRightMatrix[i+side][j];
       const rightSide = sideDownMatrix[i][j+side];
       if(Math.min(bottomSide, rightSide) >= side) {
         validSquareSide.push(side);
       }
     }
   }
   return validSquareSide.sort((a,b)=> b-a)[0]
 }
console.log(maxSquare(
   [  [0,0,0,0,0,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,0,0,1,1,1,1],
      [0,1,1,1,1,1,1]
     ]
));
