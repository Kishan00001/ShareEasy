var mongoose=require('mongoose');
mongoose.set("strictQuery", true);
mongoose.connect('mongodb+srv://Kishanfs:Kishanbackend@clusterkishan.3awamvm.mongodb.net/?retryWrites=true&w=majority');
//  mongoose.connect('mongodb://Kishan:AdminKishan@localhost:27017/share?authSource=admin',{useNewUrlParser:true});
var conn=mongoose.Collection;

var userSchema=new mongoose.Schema({
    dataname:{
        type:String,
        required:true, 
    },
    datasize:{
        type:String,
        required:true,
    },
    DateTime: {type: Date, default: Date.now},

});
userSchema.index({ DateTime: 1 }, { expireAfterSeconds: 900 });
var userModel=mongoose.model('todo',userSchema);
module.exports=userModel;