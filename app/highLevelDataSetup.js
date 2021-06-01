var args=require('minimist')(process.argv.slice(2),{string:'dataSetupEnvironment'});
console.log('highLevelDataSetup has been called for ' +args.dataSetupEnvironment);