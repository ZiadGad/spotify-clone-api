class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'fields', 'sort', 'search'];

    excludedFields.forEach((el) => delete queryObj[el]);

    if (queryObj.genres) {
      queryObj.genres = { $in: queryObj.genres.split(',') };
    }

    if (queryObj.genre) {
      queryObj.genre = { $in: queryObj.genre.split(',') };
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  sort(sortVal) {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      if (sortVal) {
        this.query.sort(sortVal);
      } else {
        this.query = this.query.sort('-createdAt');
      }
    }
    return this;
  }

  search(routeName) {
    if (this.queryString.search) {
      let filter;
      if (routeName === 'artist')
        filter = [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { bio: { $regex: this.queryString.search, $options: 'i' } },
        ];

      if (routeName === 'album')
        filter = [
          { title: { $regex: this.queryString.search, $options: 'i' } },
          { genre: { $regex: this.queryString.search, $options: 'i' } },
          { description: { $regex: this.queryString.search, $options: 'i' } },
        ];

      if (routeName === 'song')
        filter = [
          { title: { $regex: this.queryString.search, $options: 'i' } },
          { genre: { $regex: this.queryString.search, $options: 'i' } },
        ];

      if (routeName === 'playlist')
        filter = [
          { name: { $regex: this.queryString.search, $options: 'i' } },
          { description: { $regex: this.queryString.search, $options: 'i' } },
        ];
      const query = {};
      query.$or = filter;
      this.query = this.query.find(query);
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 40;
    this.limitValue = limit;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.totalPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.metadata = pagination;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeature;
