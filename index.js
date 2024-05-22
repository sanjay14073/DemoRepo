const { SLR } = require('ml-regression');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const express=require('express')

//App setup
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
async function processData(openingPrice,stockName) {
    try {
        const csvpath = path.join(__dirname, `data/${stockName}.csv`);
        const results = [];
        let ans=[];
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
                const newData=openingPrice
                const predictionforLow=regressionForLowPrice.predict(newData);
                console.log('Predicted Lowest price:', predictionforLow);
                const predictionforHigh=regressionForHighPrice.predict(newData);
                console.log('Predicted Highest price:', predictionforHigh);
                ans.push(predictionforHigh);
                ans.push(predictionforLow)
            });
            return ans;
    } catch (e) {
        console.log('Error:', e);
    }
}

app.post('/',async(req,res)=>{
    const {openingPrice,stockName}=req.body;
    let predictedPrice=await processData(openingPrice,stockName);
    res.status(200).json({"predictedPrice":predictedPrice});
})

const PORT=3000||process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server started at PORT ${PORT}`)
})
