Array.prototype.unique = function(cmp) {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(cmp(a[i],a[j]))
                a.splice(j--, 1);
        }
    }
    return a;
};

randomB = function(start,end){
  return (Math.random()*(end-start)) + start;
}
