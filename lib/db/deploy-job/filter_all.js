function(doc, req) {
    if(doc.type === 'deploy-job' && !doc['deleted']) {
        return true;
    } else {
        return false;
    }
}
