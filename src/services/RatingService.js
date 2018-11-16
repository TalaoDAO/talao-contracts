export default class RatingService {

  static getMeanRating(ratings) {

    let rating = 0;
    for (let i = 0; i < 5; i++) {
      rating += Number(ratings[i]);
    }
    rating = rating / 5;
    return rating;
  }

}
