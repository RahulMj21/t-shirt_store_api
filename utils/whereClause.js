class WhereClause {
  constructor(base, bigQuery) {
    this.base = base;
    this.bigQuery = bigQuery;
  }

  search() {
    const searchTerm = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.search,
            $options: "i",
          },
        }
      : {};
    this.base = this.base.find(searchTerm);
    return this;
  }

  filter() {
    const queryCopy = { ...this.bigQuery };

    const removableFields = ["search", "page", "limit"];

    removableFields.forEach((field) => delete queryCopy[field]);

    const queryCoptStr = JSON.stringify(queryCopy);

    const queryWithAggr = queryCoptStr.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );
    this.base = this.base.find(JSON.parse(queryWithAggr));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = this.bigQuery.page ? Number(this.bigQuery.page) : 1;

    const skip = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = WhereClause;
