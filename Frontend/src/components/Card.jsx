import './Card.css'
// import { BsSuitClubFill , BsSuitHeartFill, BsSuitDiamondFill, BsSuitSpadeFill } from "react-icons/io5"
import { BsFillSuitDiamondFill, BsFillSuitHeartFill, BsFillSuitSpadeFill, BsFillSuitClubFill  } from "react-icons/bs"
import { FaChessBoard, FaDungeon  } from "react-icons/fa";
import classNames from 'classnames'

const Card = ({ card, showCards }) => {
  const rank = card[0]
  const suitString = card[1]

  const getSuitIcon = () => {
    switch (suitString) {
      case 'h':
        return <BsFillSuitHeartFill  className="hearts" />
      case 'd':
        return <BsFillSuitDiamondFill className="diamonds" />
      case 'c':
        return <BsFillSuitClubFill className="clubs" />
      case 's':
        return <BsFillSuitSpadeFill className="spades" />
      default:
        return null
    }
  }

  const getSuit = (suit) => {
    switch(suit) {
      case 'h':
        return "hearts"
      case 'd':
        return "diamonds"
      case 'c':
        return "clubs"
      case 's':
        return "spades"
      default:
        return null
    }
  } 

  const suit = getSuit(suitString)

  if(!showCards) {
    return (
      <div className={"backside"}><FaChessBoard className="backsideImage"/></div>
    )
  }

  return (
    <div className={classNames('Card', suit)}>
      <div className="rank">{rank}</div>
      <div className="suit">{getSuitIcon()}</div>
    </div>
  )
}

export default Card