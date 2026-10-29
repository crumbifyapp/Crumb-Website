import Image from "next/image";
import { Post } from "./data";
import { ScorePuck } from "./ScorePuck";

interface FeedCardProps {
  post: Post;
}

export function FeedCard({ post }: FeedCardProps) {
  return (
    <div className="fcard">
      <div className="top">
        <Image className="av" src={`/media/people/${post.person}`} alt="" width={38} height={38} />
        <div style={{ flex: 1 }}>
          <div className="n">{post.name}</div>
          <div className="t">posted a place</div>
        </div>
      </div>
      <div className="pic">
        <Image
          src={`/media/food/${post.food}`}
          alt={post.place}
          width={900}
          height={1199}
          sizes="(max-width: 640px) min(82vw, 320px), 324px"
        />
        <span className="tag">{post.place}</span>
      </div>
      <div className="body">
        <div className="row1">
          <div className="place">
            {post.place}
            <small>{post.context}</small>
          </div>
          <ScorePuck score={post.score} />
        </div>
        <div className="tk">&quot;{post.take}&quot;</div>
        <div className="rx">
          {post.reactions.map(([emoji, count]) => (
            <span key={emoji}>
              {emoji} {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
