const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.aggregateComments = functions.firestore
.document('posts/{postId}/comments/{commentId}')
.onWrite((change,context)=>{

    console.log(context.params.postId);
    const commentId = context.params.commentId;
    const postId = context.params.postId;

    //ref to parent document
    const docRef = admin.firestore().collection('posts').doc(postId);

    //get all comments aggregate
    return docRef.collection('comments').orderBy('createdAt', 'desc').get()
    .then(querySnapshot => {
        //get total comment count
        const commentCount = querySnapshot.size;

        const recentComments = [];

        //add data from the 5 recent comments to the array
        querySnapshot.forEach(doc=>{
            recentComments.push(doc.data());
        });

        recentComments.splice(5);

        //record last comment timestamp
        const lastActivity = recentComments[0].createdAt;

        //data to update on the document
        const data = {commentCount, recentComments, lastActivity};

        return docRef.update(data);
    })
    .catch(err=>console.log(err));
})
