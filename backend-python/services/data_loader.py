# services/data_loader.py
import re, os


class Product:
    def __init__(self, data):
        self.id = data.get('id', '')
        self.name = data.get('name', '')
        self.category = data.get('category', 'General')
        self.mainCategory = data.get('mainCategory', 'General')
        self.price = float(data.get('price', 0))
        self.features = data.get('features', [])
        self.description = data.get('description', '')
        self.specifications = data.get('specifications', {})
        self.technicalSpecs = data.get('technicalSpecs', {})
        self.images = data.get('images', [])
        self.image = data.get('image', '')
        self.stock = int(data.get('stock', 10))
        self.inStock = self.stock > 0
        self.isFeatured = data.get('isFeatured', False)
        self.rating = float(data.get('rating', 4.5))
        self.order_count = int(data.get('order_count', 0))

    def get_searchable_text(self):
        return ' '.join(filter(None, [
            self.name, self.category, self.mainCategory, self.description,
            ' '.join(self.features),
            ' '.join('%s %s' % (k, v) for k, v in self.specifications.items()),
            ' '.join('%s %s' % (k, v) for k, v in self.technicalSpecs.items()),
        ]))

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'category': self.category,
            'mainCategory': self.mainCategory, 'price': self.price,
            'features': self.features, 'description': self.description,
            'specifications': self.specifications, 'technicalSpecs': self.technicalSpecs,
            'images': self.images, 'image': self.image, 'stock': self.stock,
            'inStock': self.inStock, 'isFeatured': self.isFeatured,
            'rating': self.rating, 'order_count': self.order_count,
        }


class ProductDataLoader:
    def __init__(self, data_path='../backend/data/productData.js'):
        self.data_path = data_path
        self.products = []
        self.products_by_id = {}
        self.products_by_name = {}
        self.categories = {}
        self.features_index = {}
        self.specs_index = {}

    def load_products(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            paths_to_try = [
                self.data_path,
                os.path.join(script_dir, self.data_path),
                os.path.join(script_dir, '..', 'backend', 'data', 'productData.js'),
                '../backend/data/productData.js',
                'backend/data/productData.js',
            ]
            found_path = None
            for path in paths_to_try:
                norm = os.path.normpath(path)
                if os.path.exists(norm):
                    found_path = norm
                    break

            if not found_path:
                print("Fichier productData.js introuvable")
                return []

            print("Chargement : " + found_path)
            content = open(found_path, encoding='utf-8').read()
            print("Lu : %d caracteres" % len(content))

            products_dict = self._parse_js(content)
            print("Cles extraites : %d" % len(products_dict))

            products = []
            for key, data in products_dict.items():
                p = self._create_product(key, data)
                if p:
                    products.append(p)

            self.products = products
            self._build_indexes()
            print("OK : %d produits | %d categories" % (len(products), len(self.get_all_categories())))
            return products

        except Exception as e:
            import traceback
            print("Erreur : " + str(e))
            traceback.print_exc()
            return []

    def _balanced_block(self, text, start):
        if start >= len(text) or text[start] != '{':
            return None, start
        depth = 0
        in_str = False
        esc = False
        for i in range(start, len(text)):
            c = text[i]
            if esc:
                esc = False
                continue
            if c == '\\' and in_str:
                esc = True
                continue
            if c == '"':
                in_str = not in_str
                continue
            if in_str:
                continue
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return text[start:i+1], i+1
        return None, start

    def _parse_js(self, content):
        products = {}
        root_start = content.find('{')
        if root_start == -1:
            return {}

        root_block, _ = self._balanced_block(content, root_start)
        if not root_block:
            return {}

        print("Bloc principal : %d chars" % len(root_block))
        inner = root_block[1:-1]

        i = 0
        depth = 0
        in_str = False
        esc = False

        while i < len(inner):
            c = inner[i]
            if esc:
                esc = False
                i += 1
                continue
            if c == '\\' and in_str:
                esc = True
                i += 1
                continue

            if depth == 0 and not in_str and c == '"':
                # Read key until closing quote
                end_q = i + 1
                while end_q < len(inner):
                    if inner[end_q] == '\\':
                        end_q += 2
                        continue
                    if inner[end_q] == '"':
                        break
                    end_q += 1

                key = inner[i+1:end_q]
                after = inner[end_q+1:]
                colon_idx = after.find(':')

                if colon_idx != -1 and after[:colon_idx].strip() == '':
                    after_colon = after[colon_idx+1:].lstrip()
                    if after_colon.startswith('{'):
                        skip = len(after[colon_idx+1:]) - len(after_colon)
                        brace_abs = end_q + 1 + colon_idx + 1 + skip
                        block, next_i = self._balanced_block(inner, brace_abs)
                        if block:
                            data = self._parse_body(block[1:-1])
                            if data:
                                products[key] = data
                            i = next_i
                            continue

                i = end_q + 1
                continue

            if c == '"':
                in_str = not in_str
            elif not in_str:
                if c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
            i += 1

        return products

    def _get_string_field(self, body, field):
        # Find field: "value" pattern
        idx = body.find('"' + field + '"')
        if idx == -1:
            return None
        rest = body[idx + len(field) + 2:]
        colon = rest.find(':')
        if colon == -1:
            return None
        after = rest[colon+1:].lstrip()
        if not after.startswith('"'):
            return None
        # Extract string value
        val = []
        j = 1
        while j < len(after):
            ch = after[j]
            if ch == '\\' and j+1 < len(after):
                nxt = after[j+1]
                if nxt == '"':
                    val.append('"')
                elif nxt == 'n':
                    val.append('\n')
                elif nxt == "'":
                    val.append("'")
                else:
                    val.append(nxt)
                j += 2
                continue
            if ch == '"':
                break
            val.append(ch)
            j += 1
        return ''.join(val)

    def _parse_body(self, body):
        data = {}

        for field in ['title', 'category', 'mainCategory', 'fullDescription']:
            val = self._get_string_field(body, field)
            if val:
                data[field] = val

        # Numeric fields
        for fname, ftype in [('price','float'),('stock','int'),('rating','float'),('orderCount','int'),('order_count','int')]:
            idx = body.find('"' + fname + '"')
            if idx != -1:
                rest = body[idx + len(fname) + 2:]
                colon = rest.find(':')
                if colon != -1:
                    after = rest[colon+1:].strip()
                    nm = re.match(r'(\d+(?:\.\d+)?)', after)
                    if nm:
                        key = 'order_count' if fname in ('orderCount','order_count') else fname
                        val = float(nm.group(1)) if ftype == 'float' else int(float(nm.group(1)))
                        data[key] = val

        # Arrays: features, images
        for field in ['features', 'images']:
            idx = body.find('"' + field + '"')
            if idx == -1:
                continue
            rest = body[idx:]
            arr_start = rest.find('[')
            arr_end = rest.find(']')
            if arr_start != -1 and arr_end != -1:
                arr_content = rest[arr_start+1:arr_end]
                items = []
                pos = 0
                while pos < len(arr_content):
                    q = arr_content.find('"', pos)
                    if q == -1:
                        break
                    end = q + 1
                    val = []
                    while end < len(arr_content):
                        ch = arr_content[end]
                        if ch == '\\' and end+1 < len(arr_content):
                            val.append(arr_content[end+1])
                            end += 2
                            continue
                        if ch == '"':
                            break
                        val.append(ch)
                        end += 1
                    items.append(''.join(val))
                    pos = end + 1
                data[field] = items

        # Objects: specifications, technicalSpecs
        for field in ['specifications', 'technicalSpecs']:
            idx = body.find('"' + field + '"')
            if idx == -1:
                continue
            rest = body[idx:]
            brace = rest.find('{')
            if brace == -1:
                continue
            brace_end = rest.find('}', brace)
            if brace_end == -1:
                continue
            obj_content = rest[brace+1:brace_end]
            result = {}
            pos = 0
            while pos < len(obj_content):
                # Find key
                q1 = obj_content.find('"', pos)
                if q1 == -1:
                    break
                q1e = obj_content.find('"', q1+1)
                if q1e == -1:
                    break
                k = obj_content[q1+1:q1e]
                # Find value
                rest2 = obj_content[q1e+1:]
                c2 = rest2.find(':')
                if c2 == -1:
                    break
                after2 = rest2[c2+1:].lstrip()
                if not after2.startswith('"'):
                    pos = q1e + 1
                    continue
                ve = 1
                vval = []
                while ve < len(after2):
                    ch = after2[ve]
                    if ch == '\\' and ve+1 < len(after2):
                        vval.append(after2[ve+1])
                        ve += 2
                        continue
                    if ch == '"':
                        break
                    vval.append(ch)
                    ve += 1
                result[k] = ''.join(vval)
                pos = q1e + 1 + c2 + 1 + ve + 1
            data[field] = result

        return data

    def _create_product(self, key, data):
        try:
            desc = data.get('fullDescription') or data.get('description', '')
            d = {
                'id': key,
                'name': data.get('title', key),
                'category': data.get('category', 'General'),
                'mainCategory': data.get('mainCategory', 'General'),
                'price': float(data.get('price', 0)),
                'features': data.get('features', []),
                'description': desc,
                'specifications': data.get('specifications', {}),
                'technicalSpecs': data.get('technicalSpecs', {}),
                'images': data.get('images', []),
                'stock': int(data.get('stock', 10)),
                'inStock': True,
                'isFeatured': 'Ultra' in key or 'Pro' in key,
                'rating': float(data.get('rating', 4.5)),
                'order_count': int(data.get('order_count', self._estimate_orders(key))),
            }
            d['image'] = d['images'][0] if d['images'] else '/images/products/' + key + '.png'
            return Product(d)
        except Exception as e:
            print("Erreur produit '%s': %s" % (key, e))
            return None

    def _estimate_orders(self, key):
        if 'Ultra' in key or 'Pro' in key: return 150
        if 'Eco' in key: return 200
        if 'Baby' in key: return 180
        return 100

    def _build_indexes(self):
        stop = {'de','la','le','les','et','en','un','une','des','du','pour','par',
                'sur','avec','dans','est','the','and','for','with','of','in','to','a','an'}

        def tok(t):
            return [w for w in re.findall(r'\b\w{2,}\b', t.lower()) if w not in stop]

        for p in self.products:
            self.products_by_name[p.name.lower()] = p
            self.products_by_id[p.id] = p
            for f in p.features:
                for w in tok(f):
                    self.features_index.setdefault(w, [])
                    if p not in self.features_index[w]:
                        self.features_index[w].append(p)
            for k, v in dict(list(p.specifications.items()) + list(p.technicalSpecs.items())).items():
                for w in tok('%s %s' % (k, v)):
                    self.specs_index.setdefault(w, [])
                    if p not in self.specs_index[w]:
                        self.specs_index[w].append(p)
            for cat in [p.category.lower(), p.mainCategory.lower()]:
                if cat:
                    self.categories.setdefault(cat, [])
                    if p not in self.categories[cat]:
                        self.categories[cat].append(p)

    def get_all_products(self):        return self.products
    def get_product_by_id(self, pid):  return self.products_by_id.get(pid)
    def get_all_categories(self):      return list(set(self.categories.keys()))
    def get_products_by_category(self, cat): return self.categories.get(cat.lower(), [])

    def get_product_by_name(self, name):
        n = name.lower()
        if n in self.products_by_name:
            return self.products_by_name[n]
        for stored, p in self.products_by_name.items():
            if n in stored or stored in n:
                return p
        return None

    def search_by_text(self, query, limit=10):
        stop = {'de','la','le','les','et','en','the','and','for','of','in','to'}
        kws = [w for w in re.findall(r'\b\w{2,}\b', query.lower()) if w not in stop]
        if not kws:
            return []
        scored = {}
        for p in self.products:
            s = 0
            for kw in kws:
                if kw in p.name.lower():        s += 10
                if kw in p.category.lower():     s += 6
                if kw in p.mainCategory.lower(): s += 4
                if kw in p.description.lower():  s += 2
                for f in p.features:
                    if kw in f.lower(): s += 3
                for k, v in dict(list(p.specifications.items()) + list(p.technicalSpecs.items())).items():
                    if kw in k.lower() or kw in str(v).lower(): s += 2
            if s > 0:
                scored[p.id] = (s, p)
        return [p for _, p in sorted(scored.values(), key=lambda x: x[0], reverse=True)][:limit]

    def search_by_feature(self, kw):
        return self.features_index.get(kw.lower().strip(), [])

    def search_by_spec(self, kw):
        return self.specs_index.get(kw.lower().strip(), [])