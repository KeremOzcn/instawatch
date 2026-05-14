import React from "react";
import { LeanUserNode } from "../../model/snapshot";

interface ChangeCategoryListProps {
  title: string;
  users: readonly LeanUserNode[];
  variant: 'danger' | 'warning' | 'success' | 'info' | 'purple';
  emptyText?: string;
}

export const ChangeCategoryList = ({
  title,
  users,
  variant,
  emptyText = 'Değişiklik yok',
}: ChangeCategoryListProps) => {
  return (
    <div className={`change-category change-category--${variant}`}>
      <h3 className="change-category-title">
        {title}
        <span className="change-category-count">{users.length}</span>
      </h3>
      {users.length === 0 ? (
        <p className="change-category-empty">{emptyText}</p>
      ) : (
        <ul className="change-category-list">
          {users.map(user => (
            <li key={user.id} className="change-category-item">
              <img
                className="change-avatar"
                src={user.profile_pic_url}
                alt={user.username}
              />
              <div className="change-user-info">
                <a
                  className="change-username"
                  href={`/${user.username}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.username}
                </a>
                {user.full_name && (
                  <span className="change-fullname">{user.full_name}</span>
                )}
              </div>
              {user.is_verified && <span className="change-verified">✔</span>}
              {user.is_private && <span className="change-private">🔒</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
