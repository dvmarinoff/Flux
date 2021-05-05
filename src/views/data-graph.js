import { xf, exists, equals, scale } from '../functions.js';
import { models } from '../models/models.js';

class DataGraph extends HTMLElement {
    constructor() {
        super();
        this.value = 0;
        this.metricValue = 0;
        this.bars = 0;
    }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        this.metric = this.getAttribute('metric');
        this.scale = this.getAttribute('scale') || 400;

        this.width = this.getWidth();

        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        xf.sub(`db:${this.metric}`, this.onMetric.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
        document.removeEventListener(`db:${this.metric}`, this.onMetric);
    }
    getWidth() {
        return this.getBoundingClientRect().width;
    }
    onUpdate(value) {
        this.value = value;
        this.render();
    }
    onMetric(value) {
        this.metricValue = value;
    }
    bar(zone, height, width) {
        return `<div class="graph-bar zone-${zone}" style="height: ${height}%; width: ${width}px;"></div>`;
    }
    shift() {
        this.removeChild(this.childNodes[0]);
    }
    render() {
        const zone = models.ftp.powerToZone(this.value, this.metricValue).name;
        const barHeight = scale(this.value, this.scale);
        if(this.bars >= this.width) {
            this.shift();
        }
        this.insertAdjacentHTML('beforeend', this.bar(zone, barHeight, 1));
        this.bars += 1;
    }
}

customElements.define('data-graph', DataGraph);

export { DataGraph };
