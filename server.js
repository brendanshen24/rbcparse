var express = require('express');
var app = express();
var multer = require('multer')
var cors = require('cors');
const fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const pdf = require('pdf-parse');
const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC',]
//const PORT = process.env.PORT || 80;
global.thing = ''

const monthcheck = (text) =>{
    for (let i = 0; i < months.length; i++) {
        if (months[i] === text){
            return true
        }
    }
}


app.use(cors())

const csvwriter = (originalname) =>{
    pdf(fs.readFileSync('public/' + originalname)).then(function(data) {
        const records = []
        const thing = data.text.split('\n')
        for (let i = 0; i < thing.length; i++) {
            const splitsentence = thing[i].split(' ')
            if (monthcheck(splitsentence[0]) === true){
                const splitten = thing[i].split(' ')
                const splittence = []
                for (let k = 0; k < splitten.length; k++) {
                    if (splitten[k] != ''){
                        splittence.push(splitten[k])
                    }
                }
                let trans = splittence[0] + ' ' + splittence[1]
                let pos = splittence[2] + ' ' + splittence[3]
                let desc = ''
                for (let j = 0; j < splittence.length; j++) {
                    if (j >= 4){
                        desc += splittence[j]
                        desc += ' '
                    }
                }
                desc += '\n' + thing[i + 1]
                let am = thing[i + 2]
                records.push({transdate: trans, posdate: pos, actdesc: desc, amount: am})
            }
        }
        const csvWriter = createCsvWriter({
            //path: 'public/' + originalname.split('.')[0] + '.csv',
            path: 'public/convert.csv',
            header: [
                {id: 'transdate', title: 'Transaction Date'},
                {id: 'posdate', title: 'Posting Date'},
                {id: 'actdesc', title: 'Activity Description'},
                {id: 'amount', title: 'Amount ($)'}
            ]
        });
        csvWriter.writeRecords(records)       // returns a promise
            .then(() => {
                console.log('...Done');
                //console.log(records)
                try {
                    fs.unlinkSync('public/' + originalname)
                    //file removed
                } catch(err) {
                    console.error(err)
                }
                setTimeout(function(){
                    try {
                        if (fs.existsSync('public/convert.csv')) {
                            try {
                                fs.unlinkSync('public/convert.csv')
                                //file removed
                            } catch(err) {
                                console.error(err)
                            }
                        }
                    } catch(err) {
                        console.error(err)
                    }
                }, 300000);
            });

    })

}



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null,file.originalname)
        thing = file.originalname
    }
  })
  
  var upload = multer({ storage: storage }).array('file')
  
app.get('/',function(req,res){
    return res.send('Hello Server')
})
app.post('/upload',function(req, res) {
    
    upload(req, res, function (err) {
     
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
          // A Multer error occurred when uploading.
        } else if (err) {
            return res.status(500).json(err)
          // An unknown error occurred when uploading.
        }
        csvwriter(thing)
        return res.status(200).send(req.file)
        // Everything went fine.
      })
});

app.post('/delete',function(req, res) {
    setTimeout(function(){
        try {
            if (fs.existsSync('public/convert.csv')) {
                try {
                    fs.unlinkSync('public/convert.csv')
                    //file removed
                } catch(err) {
                    console.error(err)
                }
            }
        } catch(err) {
            console.error(err)
        }
    }, 1000);
});

app.listen(8778, function() {
    console.log('App running on port 8000');
});
