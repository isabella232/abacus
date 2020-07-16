import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import React from 'react'

import Label from '@/components/Label'
import { Variation } from '@/lib/schemas'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    default: {
      marginLeft: theme.spacing(1),
    },
  }),
)

/**
 * Renders the variations in tabular formation, in the order that they're given.
 *
 * @param props.variations - The variations to render.
 */
function VariationsTable({ variations }: { variations: Variation[] }) {
  const classes = useStyles()
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell component='th' variant='head'>
            Name
          </TableCell>
          <TableCell component='th' variant='head'>
            Percent
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {variations.map((variation) => {
          return (
            <TableRow key={variation.variationId}>
              <TableCell>
                {variation.name}
                {variation.isDefault && <Label className={classes.default} text='Default' />}
              </TableCell>
              <TableCell>{variation.allocatedPercentage}%</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default VariationsTable