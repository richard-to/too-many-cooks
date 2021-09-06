const { MatchStates } = require('./enums')


class MatchState {
  constructor() {
    this.state = MatchStates.ACTIVE
    this.endMatchStartTime = null
    this.team = null
    this.endMatchDelay = 4000
  }

  getState() {
    return {
      state: this.state,
      team: this.team,
    }
  }

  setActive() {
    this.state = MatchStates.ACTIVE
    this.endMatchStartTime = null
    this.team = null
  }

  setEnded(team) {
    this.state = MatchStates.ENDED
    this.team = team
  }

  hasEnded() {
    return this.state === MatchStates.ENDED
  }

  isEndMatchTransitionReady() {
    return this.endMatchStartTime === null
  }

  startEndMatchTransition(time) {
    this.endMatchStartTime = time
  }

  isEndMatchTransitionDone(time) {
    return this.endMatchStartTime + this.endMatchDelay <= time
  }
}

module.exports = MatchState
