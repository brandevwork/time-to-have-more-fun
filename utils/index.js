import EventBus from './EventBus';
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'time-to-have-more-fun.firebaseapp.com',
  databaseURL: 'https://time-to-have-more-fun.firebaseio.com',
  projectId: 'time-to-have-more-fun',
  storageBucket: 'time-to-have-more-fun.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const snapshotToArray = querySnapshot => {
  if (!querySnapshot.docs && !querySnapshot.docs.length > 0) {
    throw new Error('No docs!!');
  }
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getAllTags = async () => {
  try {
    const querySnapshot = await db.collection('tags').get();
    const tags = snapshotToArray(querySnapshot);
    return tags;
  } catch (e) {
    console.error('📣: getAllTags -> e', e);
  }
};

/* eslint-disable */
const slugify = str => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};
/* eslint-enable */

const addPlace = async place => {
  try {
    await db
      .collection('places')
      .doc(place.id ? place.id : slugify(place.name))
      .set(place);
  } catch (e) {
    console.error('📣: addPlace -> e', e);
  }
};

const deletePlace = async place => {
  try {
    await db
      .collection('places')
      .doc(place.id)
      .delete();
  } catch (e) {
    console.error('📣: deletePlace -> e', e);
  }
};

const getPlacesByTags = async tags => {
  try {
    const placesRef = db.collection('places');
    const querySnapshot = await placesRef
      .where('tags', 'array-contains-any', tags)
      .where('visited', '==', 'No')
      .get();
    const places = snapshotToArray(querySnapshot);
    return places;
  } catch (e) {
    console.error('📣: getPlacesByTags -> e', e);
  }
};

export { EventBus, db, snapshotToArray, getAllTags, addPlace, deletePlace, getPlacesByTags };
