
var fs = require('fs');

function removeDir(path) {
    
    var files = [];
    
    if(fs.existsSync(path)) {
        
        files = fs.readdirSync(path);
        
        files.forEach(function(file, index){
            
            var curPath = path + '/' + file;
            
            if(fs.statSync(curPath).isDirectory()) {
                removeDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
            
        });
        
        fs.rmdirSync(path);
    }
    
};

module.exports.removeDir = removeDir;
