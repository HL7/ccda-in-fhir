import * as fs from 'fs';
import * as path from 'path';
import * as vkbeautify from 'vkbeautify';
import {Fhir} from 'fhir';

const fhir = new Fhir();
const strucDefFiles = fs.readdirSync('input/resources/structuredefinition');
const valueSetFiles = fs.readdirSync('input/resources/valueset');

const igContent = fs.readFileSync('input/ccda.xml').toString();
const ig = fhir.xmlToObj(igContent);

const valueSetResources = valueSetFiles.map(valueSetFile => {
    const id = valueSetFile.substring(valueSetFile.lastIndexOf('/'), valueSetFile.indexOf('.xml'));
    const content = fs.readFileSync(path.join('input/resources/valueset/', valueSetFile)).toString();
    const valueSet = fhir.xmlToObj(content);
    return {
        reference: {
            reference: `ValueSet/${id}`,
            display: valueSet.name
        }
    };
});
const strucDefResources = strucDefFiles.map(strucDefFile => {
    const id = strucDefFile.substring(strucDefFile.lastIndexOf('/'), strucDefFile.indexOf('.xml'));
    const content = fs.readFileSync(path.join('input/resources/structuredefinition/', strucDefFile)).toString();
    const structureDefinition = fhir.xmlToObj(content);
    return {
        reference: {
            reference: `StructureDefinition/${id}`,
            display: structureDefinition.name
        }
    };
});

ig.definition.resource = strucDefResources.concat(valueSetResources);

const igXml = vkbeautify.xml(fhir.objToXml(ig));
fs.writeFileSync('input/ccda.xml', igXml);