const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const APiFeatures = require('../utils/APIFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `No document found for the provided identifier #${req.params.id}`,
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      message: 'item deleted successfully',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          `Resource not found for the provided identifier #${req.params.id}`,
          404
        )
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          `Resource not found for the provided identifier #${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const urlQueries = req.customQuery || req.query;

    const features = new APiFeatures(Model.find(filter), urlQueries)
      .filter()
      .sort()
      .limit()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      requestedTime: req.requestedTime,
      length: docs.length,
      data: {
        tours: docs,
      },
    });
  });
