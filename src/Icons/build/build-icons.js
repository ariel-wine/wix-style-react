const fs = require('fs');
const co = require('co');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const esformatter = require('esformatter');
const rimraf = require('rimraf');
const forEach = require('lodash.foreach');
const camelCase = require('lodash.camelcase');
const optimizeSVG = require('./svg-optimizer');
esformatter.register(require('esformatter-jsx'));

const rootDir = path.join(__dirname, '..');
const outputDir = path.join(__dirname, '..', 'components');
const svgDir = 'raw';
let components = {};
const resetIfNotNone = val => val === 'none' ? 'none' : 'currentColor';
const attributesToRename = {'xlink:href': 'xlinkHref', class: 'className'};
const attributesToReplace = {fill: resetIfNotNone, stroke: resetIfNotNone};

const cleanPrevious = () => {
  rimraf.sync(outputDir);
  fs.mkdirSync(outputDir);
};

const toReactAttributes = ($el, $) => {
  forEach($el.attr(), (val, name) => {
    if (attributesToReplace[name]) {
      $el.attr(name, attributesToReplace[name](val));
    }

    if (name.indexOf('-') === -1 && !attributesToRename[name]) {
      return;
    }

    const newName = attributesToRename[name] || camelCase(name);
    $el.attr(newName, val).removeAttr(name);
  });

  if ($el.children().length === 0) {
    return false;
  }

  $el.children().each((index, el) => {
    const $child = $(el);
    toReactAttributes($child, $);
  });
};

const createReactSVG = (name, svg) => {
  const $ = cheerio.load(svg, {
    xmlMode: true
  });
  const $svg = $('svg');
  toReactAttributes($svg, $);
  const iconSvg = $svg.html();
  const viewBox = $svg.attr('viewBox');

  const uglyComponent = `import React from 'react';
import Icon from '../Icon';

/*eslint-disable */
const ${name} = props => (
  <Icon viewBox="${viewBox}" {...props}>   
    <g>${iconSvg}</g>
  </Icon>
);
/*eslint-enable */

export default ${name};
`;

  return esformatter.format(uglyComponent);
};

const createReactComponents = co.wrap(function* (svgPath) {
  const name = path.basename(svgPath, '.svg');
  const location = path.join('components', name + '.js');
  try {
    let svg = fs.readFileSync(svgPath, 'utf-8');
    svg = yield optimizeSVG(svg);
    const component = createReactSVG(name, svg);

    components[name] = location;

    fs.writeFileSync(path.join(rootDir, location), component, 'utf-8');
    console.log(`created: ${path.join('.', location)}`);
  } catch (err) {
    console.error(`failed to create svg file for ${name}; Error: ${err}`);
  }
});

const createIndexFile = () => {
  const iconsModule = Object.keys(components).map(name => {
    const loc = `./${components[name].replace('.js', '')}`;
    return `export {default as ${name}} from '${loc}';`;
  }).join('\n') + '\n';
  fs.writeFileSync(path.join(rootDir, 'index.js'), iconsModule, 'utf-8');
  console.log(path.join('.', 'index.js'));
};

const run = () => {
  components = {};
  return new Promise(resolve => {
    glob(rootDir + `/${svgDir}/**/*.svg`, co.wrap(function* (err, icons) {
      if (err) {
        console.error(err);
        return;
      }

      cleanPrevious();
      yield Promise.all(icons.map(icon => createReactComponents(icon)));

      createIndexFile();
      resolve();
    }));
  });
};

module.exports = run;

