const { SLR } = require('ml-regression');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function processData() {
    try {
        const csvpath = path.join(__dirname, 'data/NTPC.csv');
        const results = [];

        fs.createReadStream(csvpath)
            .pipe(csv())
            .on('data', (data) => {
                const row = {
                    Open:parseFloat(data.Open),
                    High:parseFloat(data.High),
                    Low:parseFloat(data.Low),
                    Volume:parseFloat(data.Volume),
                    Close:parseFloat(data.Close)
                };

                results.push(row);
            })
            .on('end', () => {
                const X=results.map(row => row.Open); 
                const yLow=results.map(row => row.Low);
                const yHigh=results.map(row=>row.High); 

                const regressionForLowPrice=new SLR(X, yLow);
                const regressionForHighPrice=new SLR(X,yHigh);
                //Taking the opening price
                const newData=343.00
                const predictionforLow=regressionForLowPrice.predict(newData);
                console.log('Predicted Lowest price:', predictionforLow);
                const predictionforHigh=regressionForHighPrice.predict(newData);
                console.log('Predicted Highest price:', predictionforHigh);
            });
    } catch (e) {
        console.log('Error:', e);
    }
}

async function main() {
    await processData();
}

main();
