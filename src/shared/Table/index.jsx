import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Table.module.sass';
import cn from 'classnames';
import { useTable, useSortBy, useGroupBy, usePagination } from 'react-table';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import Card from '../Card';
import Icon from '../Icon';
import AdaptiveCards from './AdaptiveCards';
import Title from '../Title';
import { clickRecursive } from '../../utils/click';
import TableMenu from '../../components/TableMenu';
import { useLocation, useNavigate } from 'react-router';
import { NextButton, PreviousButton } from '../PaginationButton';

const Table = observer(
  ({
    columns,
    data,
    title,
    headerActions,
    cardComponent,
    editComponent,
    actions, // Добавлено для передачи действий
    paging, // Добавлено для пагинации
    ...rest
  }) => {
    const [editingRowIndex, setEditingRowIndex  ] = useState(null);
    const [isSorting, setIsSorting] = useState(false);
    const [activeMenuRowIndex, setActiveMenuRowIndex] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Получение номера страницы из query параметра

    const tableInstance = useTable(
      {
        columns,
        data,
        initialState: {
          pageIndex: paging?.current ?? undefined,
          columnWidths: columns.map((col) =>
            col.width ? `${col.width}%` : 'auto',
          ),
        },
        manualPagination: !!paging, // Управляем пагинацией вручную
        pageCount: paging ? Math.floor(paging.all / paging.offset) : undefined,
      },
      useGroupBy,
      useSortBy,
      usePagination,
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      page,
      prepareRow,
      canPreviousPage,
      canNextPage,
      pageOptions,
      gotoPage,
      nextPage,
      previousPage,
      state: { pageIndex },
    } = tableInstance;
    const rowsOrPage = paging ? page : rows;

    const allPages = paging
      ? paging.totalPages ?? Math.ceil(paging.all / paging.offset)
      : undefined;
    // useEffect(() => {
    //   if (paging) {
    //     navigate({
    //       pathname: location.pathname,
    //       search: `?page=${pageIndex}`,
    //     });
    //   }
    // }, [location.pathname, pageIndex, paging]);

    const headerSortingRef = useRef(null);
    const titleJsx = (
      <Title
        smallTable={rest.smallTable}
        tableActions={{
          sorting: (decr) => {
            rows[0].allCells[0].column.toggleSortBy(decr);
          },
        }}
        actions={headerActions}
        title={title}
      />
    );

    const handleMenuClick = (index) => {
      setActiveMenuRowIndex(activeMenuRowIndex === index ? null : index);
    };
    const handleEditClick = (index) => {
      if (!isSorting) {
        setEditingRowIndex(editingRowIndex === index ? null : index);
        setTimeout(() => (editingRowIndex === index ? null : index), 5);
      }
      setIsSorting(false);
    };

    const renderRow = (row, index) => {
      prepareRow(row);
      const isEditing = editComponent && index === editingRowIndex;

      const editComponentContent =
        isEditing && typeof editComponent === 'function'
          ? () => editComponent(row.original)
          : null;

      return (
        <React.Fragment key={row.id}>
          <tr {...row.getRowProps()}>
            {row.cells.map((cell, cellIndex) => (
              <td
                className={cell.column.flexCol && styles.flexCol}
                {...cell.getCellProps()}
              >
                {cell.render('Cell')}
              </td>
            ))}
            {actions && (
              <td className={styles.menuTd}>
                <div
                  className={styles.menuButton}
                  onClick={(e) => handleMenuClick(index)}
                >
                  <Icon fill={'#6F767E'} name={'more-horizontal'} size={28} />
                </div>
                {activeMenuRowIndex === index && (
                  <TableMenu
                    actions={actions(row.original)}
                    isVisible={true}
                    onClose={() => setActiveMenuRowIndex(null)}
                  />
                )}
              </td>
            )}
            {editComponent &&
              (!editComponentContent ? (
                <td>
                  <div
                    className={styles.editButton}
                    onClick={() => {
                      handleEditClick(index);
                    }}
                  >
                    {!isEditing ? (
                      <Icon fill={'#6F767E66'} name={'edit'} size={20} />
                    ) : (
                      typeof editComponent !== 'function' && (
                        <Icon
                          fill={'#FF6A55'}
                          name={'check-circle'}
                          size={20}
                        />
                      )
                    )}
                  </div>
                </td>
              ) : (
                <td>
                  <div
                    className={styles.editButton}
                    onMouseUp={() => setEditingRowIndex(null)}
                    onClick={() => {
                      setIsSorting(false);
                      setEditingRowIndex((prev) => {
                        return index;
                      });
                      setTimeout(() => setEditingRowIndex(index), 100);
                    }}
                  >
                    <Icon fill={'#6F767E66'} name={'edit'} size={20} />
                  </div>
                </td>
              ))}
          </tr>
          {editComponentContent && !isSorting && editComponentContent()}
        </React.Fragment>
      );
    };

    return (
      <div className={rest.classContainer}>
        {!rest.headerInCard && titleJsx}
        <Card
          className={cn(styles.card, {
            [styles.card_smallTable]: rest.smallTable,
          })}
        >
          {rest.headerInCard && titleJsx}
          <div
            className={cn(styles.wrapper, {
              [styles.smallTable]: rest.smallTable,
              [styles.pagingTable]: !!paging,
            })}
          >
            <table {...getTableProps()}>
              <thead>
                {!rest.disableHeader &&
                  headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <motion.th
                          onClick={(e) => {
                            setIsSorting(true);
                            if (column.canSort && !column.isSortedDesc)
                              clickRecursive(e.target);
                          }}
                          {...column.getHeaderProps(
                            column.getSortByToggleProps(),
                          )}
                          style={{ width: column.width }}
                        >
                          <div
                            onClick={() => {
                              setIsSorting(true);
                            }}
                            className={cn(styles.headerCol_wrapper)}
                          >
                            <div
                              className={cn(styles.headerCol)}
                              ref={headerSortingRef}
                            >
                              <span>{column.render('Header')}</span>
                              {column.canSort && (
                                <span className={styles.margin}>
                                  <div className={styles.flex}>
                                    <Icon
                                      fill={'#6F767E'}
                                      name={'sort-arrow'}
                                      viewBox={'0 0 8 17'}
                                      size={16}
                                    />
                                    <div
                                      className={cn(styles.component, {
                                        [styles.active]: column.isSortedDesc,
                                      })}
                                    >
                                      <span />
                                      <span />
                                      <span />
                                    </div>
                                  </div>
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.th>
                      ))}
                    </tr>
                  ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rest.disableHeader
                  ? headerGroups.map((group) =>
                      group.headers
                        .filter((col) => col.columns && !col.parent)
                        .map((col) => {
                          const colJsx = col.render('Header');
                          return (
                            <div className={styles.disable_header} key={col.id}>
                              {Object.keys(colJsx.props).length ? (
                                <tr>
                                  <td>{colJsx}</td>
                                </tr>
                              ) : (
                                <></>
                              )}
                              {rowsOrPage
                                .filter(
                                  (el) =>
                                    el.id === col.originalId.split('_')[1],
                                )
                                .map((row) => {
                                  prepareRow(row);
                                  return (
                                    <React.Fragment
                                      key={row.id}
                                      {...row.getRowProps()}
                                    >
                                      <tr>
                                        {row.cells
                                          .filter(
                                            (cell) =>
                                              cell.column.parent.id ===
                                              col.originalId,
                                          )
                                          .map((cell) => (
                                            <td
                                              key={cell.column.id}
                                              {...cell.getCellProps()}
                                            >
                                              {cell.render('Cell')}
                                            </td>
                                          ))}
                                      </tr>
                                    </React.Fragment>
                                  );
                                })}
                            </div>
                          );
                        }),
                    )
                  : rowsOrPage.map((row, index) => renderRow(row, index))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className={styles.pagingCard}>
          {paging && (
            <div className={styles.pagination}>
              <PreviousButton
                disabled={paging.current === 1}
                onClick={() => paging.onPageChange(paging.current - 1)}
              />
              <div className={cn(styles.divider_line, styles.left)} />
              {allPages && (
                <div className={styles.pagesCount}>
                  {[...Array(allPages).keys()].map((page, index) => (
                    <div
                      key={index}
                      className={
                        pageIndex === index + 1
                          ? cn(styles.page, styles.active)
                          : styles.page
                      }
                      onClick={() => {
                        paging.onPageChange(index + 1);
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              )}
              <div className={cn(styles.divider_line, styles.right)} />

              <NextButton
                disabled={paging.current === allPages}
                onClick={() => paging.onPageChange(paging.current + 1)}
              />
            </div>
          )}
        </Card>
        {rest?.after}

        {cardComponent && (
          <AdaptiveCards
            onPagination={rest?.onPagination ?? null}
            cardComponent={cardComponent}
            rows={rows}
          />
        )}
      </div>
    );
  },
);

export default Table;
