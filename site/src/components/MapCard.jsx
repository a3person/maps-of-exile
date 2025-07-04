import { cardBadge, priceImage } from '../common'
import { globals, ninjaBase } from '../constants'
import CardDetail from './CardDetail'
import CardRateTooltip from './CardRateTooltip'

const MapCard = ({ card, tooltipTop }) => {
  const badgeClass = cardBadge(card, 10)
  const img = priceImage(card.price)
  const tooltip = card.weight > 0 && (
    <div className="m-1">
      <hr />
      <CardRateTooltip card={card} full={true} />
    </div>
  )

  const ninjaUrl = ninjaBase.replace('{league}', globals.league.toLowerCase()) + card.id

  return (
    <span className={'tooltip-tag ' + (tooltipTop ? 'tooltip-tag-top' : 'tooltip-tag-left tooltip-tag-left-mid')}>
      <span className="tooltip-tag-text map-card p-3 card-bg">
        <CardDetail card={card} />
        {tooltip}
      </span>
      <a className={badgeClass} href={ninjaUrl} target="_blank" rel="noreferrer">
        <img src={img} alt="" width="16" height="16" className="me-1" />
        {card.boss && <img src="/img/boss.webp" alt="" width="16" className="me-1" />}
        {card.name}
      </a>
    </span>
  )
}

export default MapCard
