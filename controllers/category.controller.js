import { Category } from '../models/category.js';

export const getCategories = async (req, res) => {
    const categoryList = await Category.find();
    if (!categoryList) {
        return res.status(500).json({ success: false });
    }
    res.status(200).send(categoryList);
};

export const getCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res
            .status(500)
            .json({ message: 'The category with the given ID was not found.' });
    }
    res.status(200).send(category);
};

export const createCategory = async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
    category = await category.save();
    if (!category) return res.status(400).send('the category cannot be created!');
    res.send(category);
};

export const updateCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    );
    if (!category) return res.status(400).send('the category cannot be created!');
    res.send(category);
};

export const deleteCategory = (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then((category) => {
            if (category) {
                return res
                    .status(200)
                    .json({ success: true, message: 'the category is deleted!' });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'category not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
};