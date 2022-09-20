const catchAsync = require('../helpers/catchAsync');
const AppError = require('../helpers/appError');
const APIFeatures = require('../helpers/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(
        new AppError(`No document found with id: ${document._id}`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      {
        new: true,
        runValidators: true
      }
    );

    if (!document) {
      return next(
        new AppError(`No document found with id: ${req.params.id}`, 404)
      );
    }

    res.status(201).json({
      status: 'success',
      data: { document }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { document }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const document = await query;

    if (!document) {
      return next(
        new AppError(`No document found with id: ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: { document }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Allowed nested get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const document = await features.query;

    const results = document.length;
    res.status(200).json({
      status: 'success',
      results,
      data: { document }
    });
  });
