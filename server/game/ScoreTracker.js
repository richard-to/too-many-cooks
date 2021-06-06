const { BurgerPoints, SpriteType  } = require('./enums')

class TeamScore {
  constructor() {
    this.score = 0
    this.streak = 0
    this.pointsMap = {
      [SpriteType.BURGER_BEEF]: BurgerPoints.EASY,
      [SpriteType.BURGER_BEEF_TOMATO]: BurgerPoints.MEDIUM,
      [SpriteType.BURGER_BEEF_LETTUCE]: BurgerPoints.MEDIUM,
      [SpriteType.BURGER_BEEF_TOMATO_LETTUCE]: BurgerPoints.HARD,
      [SpriteType.BURGER_TOMATO]: BurgerPoints.EASY,
      [SpriteType.BURGER_TOMATO_LETTUCE]: BurgerPoints.MEDIUM,
      [SpriteType.BURGER_LETTUCE]: BurgerPoints.EASY,
    }
  }

  decreaseScore() {
    // Invalid orders also reset the streak
    this.streak = 0
    // Minimum score is 0
    if (this.score > 0) {
      this.score -= 1
    }
  }

  resetStreak() {
    this.streak = 0
  }

  increaseScore(burger, isInOrder = false) {
    // Add points to score based on delivered burger
    this.score += this.pointsMap[burger.type]

    // Bonus points if the order was delivered in order (first in order list)
    if (isInOrder) {
      this.score += 1
    }

    // Streak bonus applied for every order in a row starting from a streak of 2
    this.streak += 1
    if (this.streak > 1) {
      this.score += this.streak - 1
    }
  }
}

class ScoreTracker {
  constructor(teamNames) {
    // Keep track of team names so we can keep the order of the teams
    this.teamNames = teamNames
    this.scores = {}
    teamNames.forEach(name => {
      this.scores[name] = new TeamScore()
    })
  }

  increaseScore(teamName, burger, isInOrder = false) {
    this.scores[teamName].increaseScore(burger, isInOrder)
    // Reset streak for other teams
    for (const [name, score] of Object.entries(this.scores)) {
      if (teamName !== name) {
        score.resetStreak()
      }
    }
  }

  decreaseScore(teamName) {
    this.scores[teamName].decreaseScore()
  }

  toArray() {
    // Return team scores as an array based on team name order
    // TODO: This is not ideal. Just doing this for now to match
    // expected format of frontend client
    return this.teamNames.map(name => this.scores[name].score)
  }
}

module.exports = ScoreTracker
