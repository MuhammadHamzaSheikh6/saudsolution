import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { banner } from './banner'
import { categories} from './category'
import blog from './blog/blogPost'
import category from './blog/category'
import blogContent from './blog/blogContent'
import contactForm from './contactForm'
import order from './dashboardDetail/order'
import { review } from './review'
import { imageGridItem } from './fram'
import salesBanner from './salesBanner'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, banner, categories, blog, blogContent, category, contactForm, order, review, imageGridItem, salesBanner],
}
