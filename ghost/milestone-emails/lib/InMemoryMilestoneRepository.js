/**
 * @typedef {import('./Milestone')} Milestone
 * @typedef {import('./MilestonesAPI').IMilestoneRepository} IMilestoneRepository
 */

/**
 * @implements {IMilestoneRepository}
 */
module.exports = class InMemoryMilestoneRepository {
    /** @type {Milestone[]} */
    #store = [];

    /** @type {Object.<string, true>} */
    #ids = {};

    /**
     * @param {Milestone} milestone
     *
     * @returns {Promise<void>}
     */
    async save(milestone) {
        if (this.#ids[milestone.id.toHexString()]) {
            const existingIndex = this.#store.findIndex((item) => {
                return item.id.equals(milestone.id);
            });
            this.#store.splice(existingIndex, 1, milestone);
        } else {
            this.#store.push(milestone);
            this.#ids[milestone.id.toHexString()] = true;
        }
    }

    /**
     * @param {'arr'|'members'} type
     * @param {string|null} currency
     *
     * @returns {Promise<Milestone>}
     */
    async getLatestByType(type, currency = 'usd') {
        if (type === 'arr') {
            return this.#store
                .filter(item => item.type === type && item.currency === currency)
                // sort by created at desc
                .sort((a, b) => (b.createdAt.valueOf() - a.createdAt.valueOf()))
                // if we end up with more values created at the same time, pick the highest value
                .sort((a, b) => b.value - a.value)[0];
        } else {
            return this.#store
                .filter(item => item.type === type)
                // sort by created at desc
                .sort((a, b) => (b.createdAt.valueOf() - a.createdAt.valueOf()))
                // if we end up with more values created at the same time, pick the highest value
                .sort((a, b) => b.value - a.value)[0];
        }
    }

    /**
     * @returns {Promise<Milestone>}
     */
    async getLastEmailSent() {
        return this.#store
            .filter(item => item.emailSentAt)
            // sort by emailSentAt desc
            .sort((a, b) => (b.emailSentAt.valueOf() - a.emailSentAt.valueOf()))
            // if we end up with more values with the same datetime, pick the highest value
            .sort((a, b) => b.value - a.value)[0];
    }

    /**
     * @param {number} value
     * @param {string} currency
     *
     * @returns {Promise<Milestone>}
     */
    async getByARR(value, currency = 'usd') {
        // find a milestone of the ARR type by a given value
        return this.#store.find((item) => {
            return item.value === value && item.type === 'arr' && item.currency === currency;
        });
    }

    /**
     * @param {number} value
     *
     * @returns {Promise<Milestone>}
     */
    async getByCount(value) {
        // find a milestone of the members type by a given value
        return this.#store.find((item) => {
            return item.value === value && item.type === 'members';
        });
    }
};
